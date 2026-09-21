'use client';

import type { SessionStatus } from '@/lib/vidu/types';

const MAP: Record<SessionStatus, { label: string; dot: string }> = {
  idle: { label: '待机', dot: 'bg-slate-400' },
  creating: { label: '创建会话中', dot: 'bg-amber-400 animate-pulse' },
  connecting: { label: '连接中', dot: 'bg-amber-400 animate-pulse' },
  handshaking: { label: '握手中', dot: 'bg-amber-400 animate-pulse' },
  joining: { label: '接入音视频', dot: 'bg-amber-400 animate-pulse' },
  live: { label: '在线', dot: 'bg-emerald-400' },
  reconnecting: { label: '重连中', dot: 'bg-amber-400 animate-pulse' },
  ended: { label: '已结束', dot: 'bg-slate-400' },
  error: { label: '异常', dot: 'bg-rose-500' },
};

export default function StatusPill({ status, detail }: { status: SessionStatus; detail?: string }) {
  const s = MAP[status] ?? MAP.idle;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      <span>{detail || s.label}</span>
    </div>
  );
}
