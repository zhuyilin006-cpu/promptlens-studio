// Vidu S1 实时交互数字人 —— 类型定义
// 依据 https://platform.vidu.cn/docs/vidu-s1
// 注意：live_id 等 int64 一律按字符串处理，避免 JS number 精度问题。

export type CallMode = 'video' | 'audio';

/** 数字人模型：vidu-s1(540p) / vidu-s2(720p 高清) */
export type ViduModel = 'vidu-s1' | 'vidu-s2';

/** 创建会话时的数字人配置 */
export interface AvatarConfig {
  /** 人设，≤5万字，必填 */
  persona: string;
  /** 形象图：URL 或 data:image/*;base64,... （与 id 二选一） */
  image_uri?: string;
  /** 已上传形象 id（与 image_uri 二选一） */
  id?: string;
  /** 音色，缺省 Tina */
  voice?: string;
  /** 开场白提示词，≤200 字符 */
  greeting_instruction?: string;
  /** 是否生成礼貌离开视频，默认 false */
  farewell_enabled?: boolean;
}

/** 前端发往 /api/vidu/session 的创建请求 */
export interface CreateLiveRequest {
  call_mode: CallMode;
  avatar: AvatarConfig;
  /** 模型，默认 vidu-s2(720p) */
  model?: ViduModel;
}

/** AliRTC 入会信息（服务端下发给前端） */
export interface RtcInfo {
  token: string;
  user_id: string;
  channel?: string;
  app_id?: string;
  [k: string]: unknown;
}

/** 创建会话响应（规范化后） */
export interface CreateLiveResponse {
  live_id: string;
  rtc: RtcInfo;
  token_expire_at?: string;
  call_mode: CallMode;
  /**
   * 本次会话所用形象资产 id（Vidu 在只传 image_uri 时自动生成并回传）。
   * 前端缓存后，后续通话只发 avatar.id 即可，不必再上传整张图片。
   * 注意：Vidu 形象资产 90 天后自动删除，过期需重新上传。
   */
  avatar_id?: string;
  /** 标记是否为 Mock 会话 */
  mock?: boolean;
  raw?: unknown;
}

/** Vidu 统一错误体 */
export interface ViduErrorBody {
  code: number;
  reason: string;
  message: string;
  metadata?: Record<string, unknown>;
}

// ---- WebSocket 信令 ----

/** 上行信令 payload 动作键 */
export interface OutboundPayload {
  conn_init?: { version: number };
  text_input?: { text: string };
  interrupt?: Record<string, never>;
  hangup?: Record<string, never>;
}

/** 上行信令统一结构 */
export interface OutboundMessage {
  type: number;
  live_id: string;
  seq_id: number;
  payload: OutboundPayload;
}

/** 下行事件（服务端 → 前端），结构较松散，做尽力解析 */
export interface InboundMessage {
  type?: number;
  seq_id?: number;
  payload?: {
    conn_init_ack?: { success: boolean; message?: string };
    subtitle?: { text: string; role?: 'user' | 'bot'; final?: boolean };
    status?: { state: string; [k: string]: unknown };
    hangup?: { hangup_reason?: string; message?: string };
    error?: ViduErrorBody;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

/** 会话生命周期状态（供 UI 使用） */
export type SessionStatus =
  | 'idle'
  | 'creating'
  | 'connecting'
  | 'handshaking'
  | 'joining'
  | 'live'
  | 'reconnecting'
  | 'ended'
  | 'error';
