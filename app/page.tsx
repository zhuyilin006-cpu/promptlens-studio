'use client';

import React, { useState } from 'react';
import FilmGridStoryboard from '@/components/tvc/FilmGridStoryboard';
import CreditBadge from '@/components/tvc/CreditBadge';
import { mockStoryboardData } from '@/data/mockStoryboard';

const workflowNodes = [
  {
    label: 'CHECKPOINT',
    title: 'Lovart_Fashion_v1.0',
    meta: 'safetensors / locked',
    status: 'READY',
  },
  {
    label: 'PROMPT MATRIX',
    title: 'Texture / Fold / SSS',
    meta: 'weights 1.20 / 0.85',
    status: 'SYNC',
  },
  {
    label: 'SAMPLER',
    title: 'Euler a / 30 Steps',
    meta: 'CFG 6.5 / seed pinned',
    status: 'ARMED',
  },
  {
    label: 'OUTPUT',
    title: 'Storyboard Frame Set',
    meta: '8 cuts / 16:9 monitor',
    status: 'LIVE',
  },
];

export default function RunningHubInspiredPage() {
  const [credits, setCredits] = useState(48250);
  const [currentTab, setCurrentTab] = useState<'app' | 'workflow'>('app');

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F4EF] text-[#111111]">
      <div className="pointer-events-none fixed inset-0 studio-grid opacity-35 [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_78%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_30%_0%,rgba(181,145,88,0.18),transparent_35rem)]" />

      <nav className="sticky top-0 z-50 border-b border-[#111111]/10 bg-[#F7F4EF]/82 backdrop-blur-xl">
        <div className="flex min-h-16 flex-col gap-3 px-5 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-5">
            <div className="flex h-8 w-8 items-center justify-center border border-[#111111] bg-[#111111] text-[10px] font-semibold tracking-widest text-[#F7F4EF]">
              PL
            </div>
            <div>
              <div className="font-serif text-xl italic leading-none tracking-wide">PromptLens Studio</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.32em] text-[#8A8175]">
                Generative image operations console
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8175]">
            <button
              onClick={() => setCurrentTab('app')}
              className={`border px-3 py-2 transition-colors ${currentTab === 'app' ? 'border-[#111111] bg-[#111111] text-[#F7F4EF]' : 'border-[#D8D1C7] bg-white/35 hover:border-[#111111] hover:text-[#111111]'}`}
            >
              01 Application Canvas
            </button>
            <button
              onClick={() => setCurrentTab('workflow')}
              className={`border px-3 py-2 transition-colors ${currentTab === 'workflow' ? 'border-[#111111] bg-[#111111] text-[#F7F4EF]' : 'border-[#D8D1C7] bg-white/35 hover:border-[#111111] hover:text-[#111111]'}`}
            >
              02 ComfyFlow Graph
            </button>
            <div className="ml-0 flex items-center gap-2 lg:ml-4">
              <CreditBadge balance={credits} />
              <div className="border border-[#111111] bg-[#111111] px-3 py-2 text-[#F7F4EF]">
                VERCEL LIVE
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="grid gap-6 border-b border-[#111111]/10 px-5 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-10">
          <div className="paper-panel hairline-frame p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[#8A8175]">
              <span className="h-px w-10 bg-[#111111]" />
              RunningHub-style split interface
            </div>
            <h1 className="max-w-4xl font-serif text-5xl font-light leading-[0.95] tracking-[-0.04em] text-[#111111] md:text-7xl">
              Fine-grained storyboard control for cinematic AI fashion.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#6F665C]">
              A restrained production desk for prompt decomposition, visual quantization, frame rebuilds and compute-aware creative operations.
            </p>
          </div>

          <aside className="grid grid-cols-2 border border-[#D8D1C7] bg-[#111111] p-4 text-[#F7F4EF] md:grid-cols-4 lg:grid-cols-2">
            {[
              ['PIPELINE', 'ACTIVE'],
              ['CUTS', `${mockStoryboardData.total_shots}`],
              ['DURATION', mockStoryboardData.total_duration],
              ['CREDIT', `${credits.toLocaleString()} CRS`],
            ].map(([label, value]) => (
              <div key={label} className="border border-white/10 p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/38">{label}</div>
                <div className="mt-3 font-serif text-2xl italic tracking-tight">{value}</div>
              </div>
            ))}
          </aside>
        </section>

        <section className="flex w-full flex-col lg:flex-row">
          {currentTab === 'workflow' && (
            <aside className="border-b border-[#111111]/10 bg-[#EEE8DE]/72 p-5 lg:w-[34%] lg:border-b-0 lg:border-r lg:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-[#111111]/15 pb-4 font-mono text-[10px] uppercase tracking-[0.22em]">
                <span>Node Workflow</span>
                <span className="text-[#8A8175]">Knot connected</span>
              </div>
              <div className="relative space-y-4">
                <div className="absolute left-[13px] top-7 h-[calc(100%-3.5rem)] w-px bg-[#111111]/18" />
                {workflowNodes.map((node) => (
                  <div key={node.label} className="relative flex gap-4">
                    <div className="relative z-10 mt-5 h-7 w-7 border border-[#111111] bg-[#F7F4EF]">
                      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#111111]" />
                    </div>
                    <div className="flex-1 border border-[#D8D1C7] bg-[#F7F4EF]/78 p-4 shadow-[8px_8px_0_rgba(17,17,17,0.03)]">
                      <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8175]">
                        <span>{node.label}</span>
                        <span className="border border-[#111111]/20 px-1.5 py-0.5 text-[#111111]">{node.status}</span>
                      </div>
                      <div className="mt-3 text-sm font-semibold tracking-tight">{node.title}</div>
                      <div className="mt-1 font-mono text-[10px] text-[#8A8175]">{node.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <div className="flex-1">
            <FilmGridStoryboard
              data={mockStoryboardData}
              onExecuteAction={() => setCredits((prev) => Math.max(0, prev - 12))}
            />
          </div>
        </section>
      </main>
    </div>
  );
}