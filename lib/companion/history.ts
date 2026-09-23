'use client';

// 自定义搭子历史记录：用 IndexedDB 存储（可容纳高分辨率图片，远超 localStorage 5MB 限制）。
import type { CompanionMemory } from './memory';

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
  /** 长边 320 的缩略图，专供 localStorage 影子备份（IndexedDB 不可用时的保底展示） */
  thumb?: string;
  width?: number;
  height?: number;
  /** Vidu 形象资产 id；存在且未过期时，通话无需再传图片 */
  avatarId?: string;
  /** 形象资产创建时间（ms），用于判断是否临近 90 天失效 */
  avatarIdAt?: number;
  /** 跨会话的关系记忆：事实、话题、通话摘要、亲密度依据 */
  memory?: CompanionMemory;
  createdAt: number;
}

/** Vidu 形象资产有效期（天） */
export const AVATAR_TTL_DAYS = 90;

/**
 * localStorage 影子备份键。
 * IndexedDB 会被浏览器静默清理（iOS Safari ITP 7 天、隐私模式、磁盘压力下驱逐），
 * 单独依赖它会导致"刚建的搭子刷新就没了"。影子备份只存元数据 + 长边 320 缩略图，
 * 体积小得多，即使配额紧张也能保住记录本身。
 */
const LS_BACKUP_KEY = 'companion:custom-backup:v1';

/** 数据来源，用于 UI 提示用户当前处于哪种存储状态 */
export type StorageSource = 'indexeddb' | 'localStorage-backup' | 'none';

export interface StorageHealth {
  /** IndexedDB 是否可用（打开/读写是否成功） */
  indexedDbOk: boolean;
  /** 本次列表数据来自哪里 */
  source: StorageSource;
  /** 最近一次存储异常的说明 */
  lastError?: string;
}

let health: StorageHealth = { indexedDbOk: true, source: 'indexeddb' };

export function getStorageHealth(): StorageHealth {
  return { ...health };
}

/**
 * 向浏览器申请「持久化存储」。获批后浏览器不会因磁盘压力或长期未访问自动清理本站数据，
 * 这是防"刷新就没了"的第一道防线。移动端 Chrome / Edge 支持；iOS Safari 会静默返回 false。
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    const storage = navigator.storage;
    if (!storage?.persist) return false;
    if (await storage.persisted?.()) return true;
    return await storage.persist();
  } catch {
    return false;
  }
}

/** 影子备份里的记忆精简版：对话原文最占空间，备份一律不存 */
function slimMemory(m?: CompanionMemory): CompanionMemory | undefined {
  if (!m) return undefined;
  return {
    ...m,
    facts: m.facts.slice(0, 8),
    topics: m.topics.slice(0, 5),
    digests: m.digests.slice(0, 2),
    transcripts: [],
  };
}

/** 擦除图片、精简记忆，只留元数据（localStorage 配额不足时的保底形态） */
function stripImages<T extends CompanionRecord>(r: T): T {
  return { ...r, image: '', thumb: '', memory: slimMemory(r.memory) };
}

function readBackup(): CompanionRecord[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(LS_BACKUP_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as CompanionRecord[]) : [];
  } catch {
    return [];
  }
}

/** 写影子备份。配额不足时自动降级：去图 → 只留最新 5 条元数据 → 放弃。 */
function writeBackup(records: CompanionRecord[]): void {
  if (typeof localStorage === 'undefined') return;
  const ordered = [...records].sort((a, b) => b.createdAt - a.createdAt);
  const attempts: CompanionRecord[][] = [
    ordered,
    ordered.map(stripImages),
    ordered.slice(0, 5).map(stripImages),
  ];
  for (const candidate of attempts) {
    try {
      localStorage.setItem(LS_BACKUP_KEY, JSON.stringify(candidate));
      return;
    } catch {
      /* 配额不足，试下一档 */
    }
  }
}

/** 合并两条记录：优先保留有图的一侧，形象资产 id 以较新的为准 */
function mergeRecord(a: CompanionRecord, b: CompanionRecord): CompanionRecord {
  return {
    ...a,
    ...b,
    image: a.image || b.image,
    thumb: a.thumb || b.thumb,
    avatarId: b.avatarId ?? a.avatarId,
    avatarIdAt: b.avatarIdAt ?? a.avatarIdAt,
  };
}

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
  const backup = readBackup();
  let records: CompanionRecord[] = [];
  try {
    const db = await openDb();
    records = await new Promise<CompanionRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as CompanionRecord[]) || []);
      req.onerror = () => reject(req.error);
    });
    health.indexedDbOk = true;
    health.lastError = undefined;
  } catch (e) {
    // IndexedDB 不可用（隐私模式 / 被禁用 / 配额异常）→ 直接用影子备份兜底
    health.indexedDbOk = false;
    health.lastError = e instanceof Error ? e.message : String(e);
  }

  if (records.length === 0) {
    // 影子备份同步过删除操作，因此"IndexedDB 空 + 备份非空"意味着 IndexedDB 数据丢了，应当回填
    records = backup;
    health.source = backup.length ? 'localStorage-backup' : 'none';
  } else {
    health.source = 'indexeddb';
    // 补上有图的一侧：若这条记录在 IndexedDB 里缺图但备份里有，用备份补回
    if (backup.length) {
      const backupMap = new Map(backup.map((r) => [r.id, r]));
      records = records.map((r) => {
        const old = backupMap.get(r.id);
        return old ? mergeRecord(old, r) : r;
      });
    }
  }

  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveCompanion(rec: CompanionRecord): Promise<void> {
  let idbError: unknown;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(rec);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    health.indexedDbOk = true;
    health.lastError = undefined;
  } catch (e) {
    // IndexedDB 写入失败不能被静默吞掉，必须向上抛出，由 UI 明确告知用户
    health.indexedDbOk = false;
    health.lastError = e instanceof Error ? e.message : String(e);
    idbError = e;
  }

  // 无论 IndexedDB 成败都维护影子备份，保证至少元数据不丢
  const backup = readBackup().filter((r) => r.id !== rec.id);
  writeBackup([rec, ...backup]);

  if (idbError) throw idbError;
}

/**
 * 局部更新记录。主要用于首次通话成功后把 Vidu 形象资产 id 写回，
 * 之后该搭子即可零图片传输直接开聊。
 */
export async function patchCompanion(
  id: string,
  patch: Partial<CompanionRecord>,
): Promise<void> {
  let idbError: unknown;
  try {
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
        const merged = { ...cur, ...patch };
        store.put(merged);
        writeBackup(
          [merged, ...readBackup().filter((r) => r.id !== merged.id)],
        );
      };
      get.onerror = () => reject(get.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    health.indexedDbOk = true;
    health.lastError = undefined;
  } catch (e) {
    health.indexedDbOk = false;
    health.lastError = e instanceof Error ? e.message : String(e);
    idbError = e;
  }

  // IndexedDB 不可用时，至少把形象资产 id 落到影子备份，别让复用收益白丢
  if (idbError) {
    const cur = readBackup().find((r) => r.id === id);
    if (cur) {
      writeBackup([{ ...cur, ...patch }, ...readBackup().filter((r) => r.id !== id)]);
    }
    throw idbError;
  }
}

/** 读取单条记录（通话结束后据此取出既有记忆再合并） */
export async function getCompanion(id: string): Promise<CompanionRecord | null> {
  try {
    const db = await openDb();
    return await new Promise<CompanionRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as CompanionRecord) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteCompanion(id: string): Promise<void> {
  let idbError: unknown;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    health.indexedDbOk = true;
    health.lastError = undefined;
  } catch (e) {
    health.indexedDbOk = false;
    health.lastError = e instanceof Error ? e.message : String(e);
    idbError = e;
  }

  // 删除必须同步到影子备份，否则下次会被当作"IndexedDB 丢了"重新回填
  writeBackup(readBackup().filter((r) => r.id !== id));

  if (idbError) throw idbError;
}

export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return `c_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}
