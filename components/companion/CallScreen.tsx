'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import StatusPill from './StatusPill';
import type { SessionStatus } from '@/lib/vidu/types';

export interface Subtitle {
  id: number;
  text: string;
  role: 'user' | 'bot';
}

export default function CallScreen({
  status,
  statusDetail,
  videoRef,
  remoteLive,
  posterImage,
  displayName,
  subtitles,
}: {
  status: SessionStatus;
  statusDetail?: string;
  videoRef: RefObject<HTMLVideoElement>;
  remoteLive: boolean;
  posterImage: string;
  displayName: string;
  subtitles: Subtitle[];
}) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#05070d]">
      {/* 锐化滤镜：轻度 unsharp mask，提升 720P 上屏后的感知清晰度 */}
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <filter id="hf-sharpen" x="0" y="0" width="100%" height="100%">
          <feConvolveMatrix
            order="3"
            preserveAlpha="true"
            kernelMatrix="0 -0.6 0 -0.6 3.4 -0.6 0 -0.6 0"
          />
        </filter>
      </svg>
      {/* 数字人视频（AliRTC 渲染到此元素）；未就绪时用占位形象铺底 */}
      <video
        ref={videoRef}
        style={{ filter: remoteLive ? 'url(#hf-sharpen) contrast(1.06) saturate(1.05)' : undefined }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${remoteLive ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        playsInline
      />
      {!remoteLive && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImage} alt={displayName} className="h-full w-full scale-105 object-cover opacity-70 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/50 via-transparent to-[#05070d]/85" />
          <div className="tech-grid absolute inset-0 opacity-40" />
        </div>
      )}

      {/* HUD 覆盖层：四角框 + 扫描线，营造科技感 */}
      <div className="hud-corners pointer-events-none absolute inset-2 rounded-[28px] ring-1 ring-white/5" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-[0.06]" />

      {/* 顶部状态 */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <StatusPill status={status} detail={statusDetail} />
        <span className="rounded-full border border-cyan-400/25 bg-black/40 px-3 py-1.5 text-xs font-medium text-cyan-100 backdrop-blur-md">
          {displayName}
        </span>
      </div>

      {/* 连接中遮罩 */}
      {status !== 'live' && status !== 'ended' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#05070d]/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-cyan-100/90">
            <span className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)]" />
            <span className="text-sm uppercase tracking-[0.2em]">{statusDetail || '正在接通…'}</span>
          </div>
        </div>
      )}

      {/* 字幕 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[168px] flex flex-col items-center gap-2 px-6">
        {subtitles.slice(-3).map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[86%] rounded-2xl px-4 py-2 text-sm leading-relaxed backdrop-blur-md ${
              s.role === 'user'
                ? 'self-end bg-gradient-to-r from-cyan-500/85 to-indigo-500/85 text-white'
                : 'self-start border border-white/10 bg-white/10 text-slate-50'
            }`}
          >
            {s.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
