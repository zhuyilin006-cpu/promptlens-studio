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
  onAction: () => void;
}

export default function ShotCard({ shot, index, onAction }: ShotCardProps) {
  const [hovered, setHovered] = useState(false);

  const copyPrompt = async () => {
    if (!shot.midjourney_shot_prompt || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(shot.midjourney_shot_prompt);
    alert('Prompt protocol copied to clipboard.');
  };

  const handleRebuild = () => {
    onAction();
    alert(`Re-quantizing render frame ${shot.shot_number} via Lovart compute.`);
  };

  return (
    <motion.article
      className="group flex min-h-[31rem] flex-col border border-[#D8D1C7] bg-[#F7F4EF] p-2 transition-colors duration-300 hover:border-[#111111]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="relative aspect-[16/9] cursor-crosshair overflow-hidden border border-[#111111] bg-[#111111]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-0 scanlines opacity-70" />
        <div className="absolute inset-0 studio-grid opacity-[0.08]" />
        <div className="absolute left-2 top-2 h-3 w-3 border-l border-t border-[#F7F4EF]/55" />
        <div className="absolute right-2 top-2 h-3 w-3 border-r border-t border-[#F7F4EF]/55" />
        <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#F7F4EF]/55" />
        <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#F7F4EF]/55" />

        <div className="absolute left-3 top-3 font-mono text-[8px] uppercase tracking-[0.22em] text-[#F7F4EF]/38">
          Render Frame / {shot.shot_number}
        </div>
        <div className="absolute right-3 top-3 h-1.5 w-1.5 bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-8 bg-[#F7F4EF]/20" />
          <div className="absolute h-8 w-px bg-[#F7F4EF]/20" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-4 font-mono text-[8px] uppercase tracking-[0.2em] text-[#F7F4EF]/32">
          <span>Lovart Compute Preview</span>
          <span>{shot.time_code}</span>
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-0 flex flex-col justify-between border border-[#111111] bg-[#F7F4EF]/96 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div>
                <div className="font-mono text-[8px] uppercase tracking-[0.26em] text-[#8A8175]">
                  Operator Panel
                </div>
                <div className="mt-2 text-xs font-semibold tracking-tight text-[#111111]">
                  Frame quantization locked
                </div>
              </div>
              <div className="grid gap-2 font-mono text-[9px] uppercase tracking-[0.18em]">
                <button
                  onClick={handleRebuild}
                  className="border border-[#111111] bg-[#111111] px-3 py-2 text-[#F7F4EF] transition-colors hover:bg-[#2A2A2A]"
                >
                  Rebuild Frame
                </button>
                {shot.midjourney_shot_prompt && (
                  <button
                    onClick={copyPrompt}
                    className="border border-[#D8D1C7] bg-white/45 px-3 py-2 text-[#111111] transition-colors hover:border-[#111111]"
                  >
                    Copy Prompt Protocol
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="mb-3 flex items-center justify-between border-b border-[#111111]/10 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8175]">
          <span>Shot / {shot.shot_number}</span>
          <span className="text-[#111111]">{shot.time_code}</span>
        </div>

        <h3 className="font-serif text-xl font-light italic leading-tight tracking-[-0.02em] text-[#111111]">
          {shot.shot_title}
        </h3>

        <div className="my-4 grid grid-cols-2 border border-[#D8D1C7] font-mono text-[9px] uppercase tracking-[0.14em] text-[#8A8175]">
          <div className="border-r border-[#D8D1C7] p-2">
            <span className="block text-[8px] text-[#A49A8F]">Camera</span>
            <strong className="mt-1 block font-medium text-[#111111]">{shot.camera_movement}</strong>
          </div>
          <div className="p-2">
            <span className="block text-[8px] text-[#A49A8F]">Transition</span>
            <strong className="mt-1 block font-medium text-[#111111]">{shot.transition}</strong>
          </div>
        </div>

        <p className="text-[11px] leading-6 text-[#6F665C] line-clamp-4 group-hover:line-clamp-none">
          {shot.visual_description}
        </p>

        <div className="mt-auto border-t border-[#111111]/10 pt-3 text-[10px] italic leading-5 text-[#7B5A32]">
          {shot.audio_sfx}
        </div>
      </div>
    </motion.article>
  );
}