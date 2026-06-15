'use client';

import React, { useState } from 'react';
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
  selectedShotNumber: string;
  processingShotNumber: string | null;
  rebuiltShots: string[];
  onSelectShot: (shotNumber: string) => void;
  onExecuteAction: (shotNumber: string) => void;
}

export default function FilmGridStoryboard({
  data,
  selectedShotNumber,
  processingShotNumber,
  rebuiltShots,
  onSelectShot,
  onExecuteAction,
}: FilmGridStoryboardProps) {
  const [detailCopyState, setDetailCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const selectedShot = data.shots.find((shot) => shot.shot_number === selectedShotNumber) ?? data.shots[0];

  const copySelectedPrompt = async () => {
    if (!selectedShot?.midjourney_shot_prompt || !navigator.clipboard?.writeText) {
      setDetailCopyState('failed');
      window.setTimeout(() => setDetailCopyState('idle'), 1200);
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedShot.midjourney_shot_prompt);
      setDetailCopyState('copied');
    } catch {
      setDetailCopyState('failed');
    }

    window.setTimeout(() => setDetailCopyState('idle'), 1200);
  };

  return (
    <section className="w-full bg-[#F5F1EA] px-4 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[#8A8175]">
            <span className="h-px w-10 bg-[#111111]/40" />
            分镜工作台
          </div>
          <h2 className="font-serif text-5xl font-light leading-none tracking-[-0.055em] text-[#111111] md:text-6xl">
            {data.story_name}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6A6258]">{data.one_line_theme}</p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#111111]/10 pt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8175] lg:border-t-0 lg:pt-0">
          <span><b className="mr-2 text-[#111111]">{data.total_duration}</b>总时长</span>
          <span><b className="mr-2 text-[#111111]">{data.total_shots}</b>分镜</span>
          <span><b className="mr-2 text-[#111111]">{rebuiltShots.length}</b>已重绘</span>
          <span>{processingShotNumber ? `处理中 ${processingShotNumber}` : '预览已锁定'}</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
        <div className="glass-panel p-3 lg:p-5">
          <motion.div
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {data.shots.map((shot: ShotDetail, index: number) => (
              <ShotCard
                key={shot.shot_number}
                shot={shot}
                index={index}
                selected={selectedShotNumber === shot.shot_number}
                processing={processingShotNumber === shot.shot_number}
                rebuilt={rebuiltShots.includes(shot.shot_number)}
                onSelect={() => onSelectShot(shot.shot_number)}
                onAction={() => onExecuteAction(shot.shot_number)}
              />
            ))}
          </motion.div>
        </div>

        {selectedShot && (
          <aside className="glass-panel sticky top-24 h-fit p-4 text-[#111111]">
            <div className="mb-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-[#8A8175]">
              <span>分镜检查器</span>
              <span>{processingShotNumber === selectedShot.shot_number ? '处理中' : rebuiltShots.includes(selectedShot.shot_number) ? '已重绘' : '就绪'}</span>
            </div>
            <div className="border-b border-[#111111]/10 pb-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#A49A8F]">镜头 {selectedShot.shot_number}</div>
              <h3 className="mt-2 font-serif text-3xl font-light italic leading-none tracking-[-0.03em]">
                {selectedShot.shot_title}
              </h3>
            </div>
            <div className="mt-4 space-y-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8A8175]">
              {[
                ['时码', selectedShot.time_code],
                ['镜头运动', selectedShot.camera_movement],
                ['转场', selectedShot.transition],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-[#111111]/7 pb-2">
                  <span>{label}</span>
                  <strong className="text-right font-medium text-[#111111]">{value}</strong>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[11px] leading-6 text-[#6A6258]">{selectedShot.visual_description}</p>
            <div className="mt-5 border-t border-[#111111]/10 pt-4 text-[10px] italic leading-5 text-[#7B5A32]">
              {selectedShot.audio_sfx}
            </div>
            <button
              onClick={copySelectedPrompt}
              className="mt-5 w-full bg-[#111111] px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#F5F1EA] transition-colors hover:bg-[#2A2A2A]"
            >
              {detailCopyState === 'copied' ? '已复制' : detailCopyState === 'failed' ? '复制失败' : '复制完整提示词'}
            </button>
          </aside>
        )}
      </div>

      <footer className="mt-8 grid grid-cols-1 gap-px overflow-hidden bg-[#111111]/10 text-[#111111] md:grid-cols-3">
        {[
          ['视频主线', data.video_mainline],
          ['核心转场', data.core_transitions],
          ['视觉记忆点', data.memory_point],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#F5F1EA]/90 p-5">
            <h4 className="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A8175]">{label}</h4>
            <p className="text-xs leading-6 text-[#6A6258]">{value}</p>
          </div>
        ))}
      </footer>
    </section>
  );
}
