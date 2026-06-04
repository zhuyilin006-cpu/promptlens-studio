'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ShotCard from './ShotCard';

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

interface StoryboardData {
  story_name: string;
  one_line_theme: string;
  total_duration: string;
  total_shots: number;
  pacing: string;
  visual_style: string;
  video_mainline: string;
  core_transitions: string;
  memory_point: string;
  shots: ShotDetail[];
}

interface FilmGridStoryboardProps {
  data: StoryboardData;
  onExecuteAction: () => void;
}

export default function FilmGridStoryboard({ data, onExecuteAction }: FilmGridStoryboardProps) {
  return (
    <div className="w-full px-12 py-8 bg-[#FBFBFA]">
      {/* 高定杂志排版信息流 */}
      <header className="border-b border-[#111111] pb-6 mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 select-none">
        <div>
          <div className="text-[9px] font-mono tracking-[0.25em] text-gray-400 uppercase mb-2">
            PROMPTLENS STUDIO / GENERATIVE PIPELINE
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-[#111111]">
            {data.story_name}
          </h1>
          <p className="text-xs text-gray-500 font-sans tracking-wider mt-1.5">
            {data.one_line_theme}
          </p>
        </div>

        {/* 工业数据元网格 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] border-l border-gray-300 pl-6 lg:w-72">
          <span className="text-gray-400">DURATION</span>
          <span className="text-right font-medium text-[#111111]">{data.total_duration}</span>
          <span className="text-gray-400">STORYBOARD</span>
          <span className="text-right font-medium text-[#111111]">{data.total_shots} CUTS</span>
          <span className="text-gray-400">PACING</span>
          <span className="text-right font-medium text-[#111111] truncate">{data.pacing}</span>
          <span className="text-gray-400">VISUAL STYLE</span>
          <span className="text-right font-medium text-[#111111] truncate">{data.visual_style}</span>
        </div>
      </header>

      {/* 2×4 分镜矩阵 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {data.shots.map((shot: ShotDetail, index: number) => (
          <ShotCard 
            key={shot.shot_number} 
            shot={shot} 
            index={index} 
            onAction={onExecuteAction}
          />
        ))}
      </motion.div>

      {/* 底部策划摘要卡片 */}
      <footer className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8 font-sans select-none">
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">视频主线 / VIDEO MAINLINE</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{data.video_mainline}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">核心转场 / CORE TRANSITIONS</h4>
          <p className="text-xs text-gray-600 leading-relaxed">{data.core_transitions}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">核心记忆点 / VISUAL HOOK</h4>
          <p className="text-xs font-medium text-amber-950 leading-relaxed">{data.memory_point}</p>
        </div>
      </footer>
    </div>
  );
}