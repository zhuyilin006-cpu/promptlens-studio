'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShotDetail {
  shot_number: string;
  time_code: string;
  shot_title: string;
  camera_movement: string;
  transition: string;
  visual_description: string;
  audio_sfx: string;
  midjourney_shot_prompt?: string;
}

interface ShotCardProps {
  shot: ShotDetail;
  index: number;
  selected: boolean;
  processing: boolean;
  rebuilt: boolean;
  onSelect: () => void;
  onAction: () => void;
}

export default function ShotCard({ shot, index, selected, processing, rebuilt, onSelect, onAction }: ShotCardProps) {
  const [hovered, setHovered] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copyPrompt = async () => {
    if (!shot.midjourney_shot_prompt || !navigator.clipboard?.writeText) {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 1200);
      return;
    }

    try {
      await navigator.clipboard.writeText(shot.midjourney_shot_prompt);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => setCopyState('idle'), 1200);
  };

  const statusLabel = processing ? '处理中' : rebuilt ? '已重绘' : selected ? '已选中' : '就绪';

  return (
    <motion.article
      onClick={onSelect}
      className={`group cursor-pointer bg-[#F9F5ED]/80 p-2 transition-all duration-300 ${selected ? 'shadow-[inset_0_0_0_1px_#111111,0_18px_50px_rgba(17,17,17,0.10)]' : 'shadow-[inset_0_0_0_1px_rgba(17,17,17,0.08)] hover:shadow-[inset_0_0_0_1px_rgba(17,17,17,0.32),0_16px_40px_rgba(17,17,17,0.08)]'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="render-surface soft-vignette relative aspect-[4/5] overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-0 scanlines opacity-35" />
        {processing && <div className="absolute inset-0 animate-pulse bg-[#F5F1EA]/12" />}
        <div className="absolute left-3 top-3 font-mono text-[8px] uppercase tracking-[0.24em] text-white/42">
          画面 {shot.shot_number}
        </div>
        <div className={`absolute right-3 top-3 h-1.5 w-1.5 ${processing ? 'animate-ping bg-amber-300' : rebuilt ? 'bg-blue-300' : 'bg-emerald-400'}`} />
        <div className="absolute inset-x-6 top-1/2 h-px bg-white/12" />
        <div className="absolute inset-y-6 left-1/2 w-px bg-white/10" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/34">{statusLabel}</div>
          <div className="mt-1 font-serif text-2xl font-light italic leading-none text-white/90">{shot.shot_number}</div>
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-x-3 bottom-3 z-10 bg-[#F5F1EA]/94 p-3 text-[#111111] shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.22em] text-[#8A8175]">
                <span>操作</span>
                <span>{shot.time_code}</span>
              </div>
              <div className="grid gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em]">
                <button
                  onClick={onAction}
                  disabled={processing}
                  className="bg-[#111111] px-3 py-2 text-[#F5F1EA] transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#7B746B]"
                >
                  {processing ? '处理中' : '重绘此镜头'}
                </button>
                {shot.midjourney_shot_prompt && (
                  <button
                    onClick={copyPrompt}
                    className="bg-white/70 px-3 py-2 text-[#111111] shadow-[inset_0_0_0_1px_rgba(17,17,17,0.12)] transition-colors hover:bg-white"
                  >
                    {copyState === 'copied' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制提示词'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-[#9A9084]">
          <span>镜头 / {shot.shot_number}</span>
          <span>{shot.time_code}</span>
        </div>
        <h3 className="font-serif text-2xl font-light italic leading-none tracking-[-0.03em] text-[#111111]">
          {shot.shot_title}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-[#7C7165]">
          <span className="bg-[#EEE8DE] px-2 py-1">{shot.camera_movement}</span>
          <span className="bg-[#EEE8DE] px-2 py-1">{shot.transition}</span>
        </div>
        <p className="mt-4 line-clamp-3 text-[11px] leading-6 text-[#6A6258]">
          {shot.visual_description}
        </p>
        <div className="mt-4 border-t border-[#111111]/10 pt-3 text-[10px] italic leading-5 text-[#7B5A32] line-clamp-2">
          {shot.audio_sfx}
        </div>
      </div>
    </motion.article>
  );
}
