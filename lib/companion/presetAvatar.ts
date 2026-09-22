'use client';

// 精选（预设）搭子的形象资产缓存。
// 预设形象每次传的都是同一张公网图，若不缓存，Vidu 每次都要重新为其生成一次资产。
// 首次创建会话后把回传的 avatar_id 存进 localStorage，之后只发 id，开聊更快。

import { AVATAR_TTL_DAYS } from './history';

const PRESET_AVATAR_PREFIX = 'companion:preset-avatar:';

export function readPresetAvatar(id: string): string | null {
  try {
    const raw = localStorage.getItem(PRESET_AVATAR_PREFIX + id);
    if (!raw) return null;
    const { avatarId, at } = JSON.parse(raw) as { avatarId?: string; at?: number };
    if (!avatarId || typeof at !== 'number') return null;
    // 形象资产 90 天过期，留 2 天余量
    if (Date.now() - at > (AVATAR_TTL_DAYS - 2) * 24 * 60 * 60 * 1000) return null;
    return avatarId;
  } catch {
    return null;
  }
}

export function writePresetAvatar(id: string, avatarId: string): void {
  try {
    localStorage.setItem(
      PRESET_AVATAR_PREFIX + id,
      JSON.stringify({ avatarId, at: Date.now() }),
    );
  } catch {
    /* localStorage 不可用时忽略，退化为每次重新处理 */
  }
}

export function clearPresetAvatar(id: string): void {
  try {
    localStorage.removeItem(PRESET_AVATAR_PREFIX + id);
  } catch {
    /* noop */
  }
}
