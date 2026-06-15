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
    <section className="w-full bg-[#F7F4EF] px-5 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_24rem]">
        <div className="border border-[#111111]/10 bg-[#EFE8DD]/64 p-4 lg:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#8A8175]">
                <span className="h-px w-8 bg-[#111111]" />
                PromptLens Studio / Generative Pipeline
              </div>
              <h2 className="font-serif text-4xl font-light leading-none tracking-[-0.035em] text-[#111111] md:text-5xl">
                {data.story_name}
              </h2>
              <p className="mt-3 max-w-xl text-xs leading-6 tracking-wide text-[#6F665C]">
                {data.one_line_theme}
              </p>
            </div>

            <div className="grid min-w-full grid-cols-2 border border-[#D8D1C7] bg-[#F7F4EF] font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8175] sm:min-w-[28rem]">
              <div className="border-b border-r border-[#D8D1C7] p-3">
                <span className="block text-[8px] text-[#A49A8F]">Duration</span>
                <strong className="mt-2 block text-[#111111]">{data.total_duration}</strong>
              </div>
              <div className="border-b border-[#D8D1C7] p-3">
                <span className="block text-[8px] text-[#A49A8F]">Storyboard</span>
                <strong className="mt-2 block text-[#111111]">{data.total_shots} Cuts</strong>
              </div>
              <div className="border-r border-[#D8D1C7] p-3">
                <span className="block text-[8px] text-[#A49A8F]">Pacing</span>
                <strong className="mt-2 block truncate text-[#111111]">{data.pacing}</strong>
              </div>
              <div className="p-3">
                <span className="block text-[8px] text-[#A49A8F]">Visual Style</span>
                <strong className="mt-2 block truncate text-[#111111]">{data.visual_style}</strong>
              </div>
            </div>
          </div>
        </div>

        {selectedShot && (
          <aside className="border border-[#111111]/12 bg-[#111111] p-4 text-[#F7F4EF]">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/38">
              <span>Selected Shot</span>
              <span>{processingShotNumber === selectedShot.shot_number ? 'Processing' : rebuiltShots.includes(selectedShot.shot_number) ? 'Rebuilt' : 'Ready'}</span>
            </div>
            <div className="font-serif text-2xl font-light italic leading-tight">{selectedShot.shot_title}</div>
            <div className="mt-3 grid grid-cols-2 gap-px bg-white/10 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
              {[
                ['Shot', selectedShot.shot_number],
                ['Time', selectedShot.time_code],
                ['Camera', selectedShot.camera_movement],
                ['Transition', selectedShot.transition],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#111111] p-2">
                  <span className="block text-white/25">{label}</span>
                  <strong className="mt-1 block text-white/78">{value}</strong>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-white/64">{selectedShot.visual_description}</p>
            <div className="mt-3 border-t border-white/10 pt-3 text-[10px] italic leading-5 text-[#C6A36C]">
              {selectedShot.audio_sfx}
            </div>
            <button
              onClick={copySelectedPrompt}
              className="mt-4 w-full border border-white/18 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-white/42 hover:bg-white/[0.06]"
            >
              {detailCopyState === 'copied' ? 'Copied' : detailCopyState === 'failed' ? 'Copy Failed' : 'Copy Full Prompt'}
            </button>
          </aside>
        )}
      </div>

      <div className="border border-[#111111]/12 bg-[#FBF8F1] p-3 shadow-[0_24px_80px_rgba(17,17,17,0.06)] lg:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-[#111111]/10 pb-3 font-mono text-[9px] uppercase tracking-[0.24em] text-[#8A8175]">
          <span>Storyboard Board / 2 × 4 Frame Matrix</span>
          <span>{processingShotNumber ? `Processing Shot ${processingShotNumber}` : 'Output preview locked'}</span>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
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

      <footer className="mt-8 grid grid-cols-1 border border-[#D8D1C7] bg-[#111111] text-[#F7F4EF] md:grid-cols-3">
        {[
          ['VIDEO MAINLINE', data.video_mainline],
          ['CORE TRANSITIONS', data.core_transitions],
          ['VISUAL HOOK', data.memory_point],
        ].map(([label, value], index) => (
          <div key={label} className={`p-5 ${index < 2 ? 'border-b border-white/10 md:border-b-0 md:border-r' : ''}`}>
            <h4 className="mb-3 font-mono text-[9px] uppercase tracking-[0.25em] text-white/38">{label}</h4>
            <p className="text-xs leading-6 text-white/72">{value}</p>
          </div>
        ))}
      </footer>
    </section>
  );
}
