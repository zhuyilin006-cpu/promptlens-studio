'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    if (shot.midjourney_shot_prompt) {
      navigator.clipboard.writeText(shot.midjourney_shot_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <motion.div
      className="group bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300 overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 分镜编号 + 时码 */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-baseline border-b border-gray-100">
        <span className="font-mono text-[10px] font-bold text-[#111111] tracking-wider">
          SHOT {shot.shot_number}
        </span>
        <span className="font-mono text-[9px] text-gray-400">
          {shot.time_code}
        </span>
      </div>

      {/* 分镜标题 */}
      <div className="px-4 py-3">
        <h3 className="font-serif italic text-sm text-[#111111] leading-snug">
          {shot.shot_title}
        </h3>
      </div>

      {/* 视觉描述 */}
      <div className="px-4 pb-3 flex-1">
        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">
          {shot.visual_description}
        </p>
      </div>

      {/* 技术参数网格 */}
      <div className="px-4 py-3 bg-gray-50/50 border-y border-gray-100 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px]">
        <div>
          <span className="text-gray-400">CAM: </span>
          <span className="text-[10px]">{shot.camera_movement}</span>
        </div>
        <div>
          <span className="text-gray-400">TRAN: </span>
          <span className="text-[10px]">{shot.transition}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">SFX: </span>
          <span className="text-[10px] text-gray-600">{shot.audio_sfx}</span>
        </div>
      </div>

      {/* Midjourney Prompt */}
      {shot.midjourney_shot_prompt && (
        <div className="px-4 py-3">
          <div className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">
            Midjourney Prompt
          </div>
          <div 
            onClick={copyPrompt}
            className="text-[9px] text-gray-600 bg-gray-100 px-2 py-2 leading-relaxed cursor-pointer hover:bg-gray-200 transition-colors line-clamp-3 font-mono"
          >
            {shot.midjourney_shot_prompt}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={() => { onAction(); copyPrompt(); }}
          className="w-full text-[9px] font-mono bg-[#111111] text-white py-2 hover:bg-gray-800 active:bg-gray-900 transition-colors tracking-wider flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <span>COPIED</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              <span>EXECUTE & COPY</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}