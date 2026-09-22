'use client';

// 自定义搭子历史记录：用 IndexedDB 存储（可容纳高分辨率图片，远超 localStorage 5MB 限制）。

/**
 * 存储策略（重要）：
 * - image 存「长边 1024」的复用图（约 200~400KB）。它同时承担两个职责：
 *   列表/通话页的 UI 展示，以及形象资产失效时的兜底重传。
 *   不存十几 MB 的原图，否则 IndexedDB 很快被撑爆配额。
 * - 生成数字人的首选是 avatarId（Vidu 形象资产 id）。首次通话上传高清图后由服务端回传并缓存，
 *   之后同一搭子开聊只发 avatar.id —— 零图片传输、秒开。
 * - Vidu 形象资产 90 天后自动删除，avatarIdAt 用于判断是否已临近失效。
 */
export interface CompanionRecord {
  id: string;
  name: string;
  persona: string;
  voice: string;
  greeting: string;
  /** UI 展示 + 兜底重传用的复用图（长边 1024），非原始高清图 */
  image: string;
  width?: number;
  height?: number;
  /** Vidu 形象资产 id；存在且未过期时，通话无需再传图片 */
  avatarId?: string;
  /** 形象资产创建时间（ms），用于判断是否临近 90 天失效 */
  avatarIdAt?: number;
  createdAt: number;
}

/** Vidu 形象资产有效期（天） */
export const AVATAR_TTL_DAYS = 90;

/** 形象资产是否仍然可用（留 2 天余量，避免刚好卡在过期点） */
export function isAvatarUsable(rec: CompanionRecord): boolean {
  if (!rec.avatarId) return false;
  const at = rec.avatarIdAt ?? rec.createdAt;
  const ageDays = (Date.now() - at) / (24 * 60 * 60 * 1000);
  return ageDays < AVATAR_TTL_DAYS - 2;
}

const DB_NAME = 'companion-studio';
const STORE = 'custom-companions';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('当前环境不支持 IndexedDB'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('打开数据库失败'));
  });
}

export async function listCompanions(): Promise<CompanionRecord[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const list = (req.result as CompanionRecord[]) || [];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveCompanion(rec: CompanionRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 局部更新记录。主要用于首次通话成功后把 Vidu 形象资产 id 写回，
 * 之后该搭子即可零图片传输直接开聊。
 */
export async function patchCompanion(
  id: string,
  patch: Partial<CompanionRecord>,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const get = store.get(id);
    get.onsuccess = () => {
      const cur = get.result as CompanionRecord | undefined;
      if (!cur) {
        resolve();
        return;
      }
      store.put({ ...cur, ...patch });
    };
    get.onerror = () => reject(get.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCompanion(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return `c_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
