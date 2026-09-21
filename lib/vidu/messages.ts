// WebSocket 信令的构造与解析。
// 上行统一结构：{ type, live_id, seq_id, payload: { <action>: {...} } }
// conn_init 依据官方文档；text/interrupt/hangup 沿用同一 envelope，
// 若官方后续调整 type 码或 payload 键，仅需在此集中修改。
import type { InboundMessage, OutboundMessage } from './types';

export const MSG_TYPE = {
  CONTROL: 1,
} as const;

let seq = 0;
function nextSeq(): number {
  seq += 1;
  return seq;
}

export function buildConnInit(liveId: string): OutboundMessage {
  return {
    type: MSG_TYPE.CONTROL,
    live_id: liveId,
    seq_id: nextSeq(),
    payload: { conn_init: { version: 1 } },
  };
}

export function buildText(liveId: string, text: string): OutboundMessage {
  return {
    type: MSG_TYPE.CONTROL,
    live_id: liveId,
    seq_id: nextSeq(),
    payload: { text_input: { text } },
  };
}

export function buildInterrupt(liveId: string): OutboundMessage {
  return {
    type: MSG_TYPE.CONTROL,
    live_id: liveId,
    seq_id: nextSeq(),
    payload: { interrupt: {} },
  };
}

export function buildHangup(liveId: string): OutboundMessage {
  return {
    type: MSG_TYPE.CONTROL,
    live_id: liveId,
    seq_id: nextSeq(),
    payload: { hangup: {} },
  };
}

export function encode(msg: OutboundMessage): string {
  return JSON.stringify(msg);
}

export function parseInbound(data: string): InboundMessage | null {
  try {
    return JSON.parse(data) as InboundMessage;
  } catch {
    return null;
  }
}

/** 常见 hangup_reason → 用户可读文案 */
export function describeHangup(reason?: string): string {
  const map: Record<string, string> = {
    user_hangup: '你已结束通话',
    idle_timeout: '长时间无互动，已自动结束',
    max_duration: '已达到最长通话时长',
    insufficient_balance: '账户额度不足，通话结束',
    server_error: '服务异常，通话中断',
    kicked: '会话被服务端关闭',
    network_error: '网络异常，通话中断',
  };
  if (!reason) return '通话已结束';
  return map[reason] || `通话已结束（${reason}）`;
}
