'use client';

import React, { useMemo, useState } from 'react';
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
  const [selectedShotNumber, setSelectedShotNumber] = useState(mockStoryboardData.shots[0]?.shot_number ?? '');
  const [activeNodeLabel, setActiveNodeLabel] = useState(workflowNodes[0].label);
  const [processingShotNumber, setProcessingShotNumber] = useState<string | null>(null);
  const [rebuiltShots, setRebuiltShots] = useState<string[]>([]);

  const activeNode = useMemo(
    () => workflowNodes.find((node) => node.label === activeNodeLabel) ?? workflowNodes[0],
    [activeNodeLabel]
  );

  const handleSelectShot = (shotNumber: string) => {
    setSelectedShotNumber(shotNumber);
  };

  const handleExecuteShot = (shotNumber: string) => {
    if (credits <= 0 || processingShotNumber) {
      return;
    }

    setSelectedShotNumber(shotNumber);
    setProcessingShotNumber(shotNumber);
    setCredits((prev) => Math.max(0, prev - 12));

    window.setTimeout(() => {
      setProcessingShotNumber(null);
      setRebuiltShots((prev) => (prev.includes(shotNumber) ? prev : [...prev, shotNumber]));
    }, 900);
  };

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
        <section className="px-4 py-6 lg:px-8 lg:py-10">
          <div className="grid min-h-[36rem] gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="glass-panel corner-frame flex flex-col justify-between p-7 text-[#111111] lg:p-12">
              <div>
                <div className="mb-10 flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.34em] text-[#8A8175]">
                  <span>PromptLens Studio</span>
                  <span className="h-px w-16 bg-[#111111]/30" />
                  <span>{currentTab === 'app' ? 'Canvas Mode' : 'Graph Mode'}</span>
                </div>
                <h1 className="max-w-4xl font-serif text-6xl font-light leading-[0.86] tracking-[-0.075em] text-[#111111] md:text-8xl xl:text-[8.75rem]">
                  Cinema-grade prompt control.
                </h1>
                <p className="mt-8 max-w-xl text-sm leading-7 text-[#6A6258] md:text-base">
                  A quiet production surface for image direction, node logic and frame-level rebuilds — designed like a studio console, not a dashboard.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#111111]/10 pt-5 font-mono text-[9px] uppercase tracking-[0.22em] text-[#8A8175]">
                {[
                  ['Mode', currentTab === 'app' ? 'Canvas' : 'Graph'],
                  ['Node', activeNode.status],
                  ['Shot', selectedShotNumber || 'None'],
                  ['Credit', `${credits.toLocaleString()} CRS`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="mr-2 text-[#B0A599]">{label}</span>
                    <strong className="text-[#111111]">{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative overflow-hidden bg-[#111111] p-4 text-[#F7F4EF] console-glow lg:p-6">
              <div className="absolute inset-0 render-surface soft-vignette" />
              <div className="absolute inset-0 scanlines opacity-45" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.26em] text-white/38">
                  <span>Hero Render Preview</span>
                  <span className="flex items-center gap-2 text-emerald-300/85"><span className="h-1.5 w-1.5 bg-emerald-400" /> Live</span>
                </div>

                <div className="relative flex-1 overflow-hidden border border-white/10 bg-black/20 p-5">
                  <div className="absolute left-4 top-4 h-8 w-8 border-l border-t border-white/28" />
                  <div className="absolute right-4 top-4 h-8 w-8 border-r border-t border-white/28" />
                  <div className="absolute bottom-4 left-4 h-8 w-8 border-b border-l border-white/28" />
                  <div className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-white/28" />
                  <div className="absolute left-8 top-8 max-w-xs glass-panel bg-white/[0.08] p-4 text-[#F7F4EF]">
                    <div className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/36">Active Node</div>
                    <div className="mt-2 text-sm font-semibold text-white/90">{activeNode.title}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/44">{activeNode.meta}</div>
                  </div>
                  <div className="absolute bottom-8 right-8 w-44 border border-white/12 bg-black/28 p-4 font-mono uppercase tracking-[0.2em]">
                    <div className="text-[8px] text-white/32">Selected Frame</div>
                    <div className="mt-3 font-serif text-4xl font-light italic text-white">{selectedShotNumber || '—'}</div>
                    <div className="mt-2 text-[8px] text-white/35">{processingShotNumber ? 'Processing' : `${rebuiltShots.length} rebuilt`}</div>
                  </div>
                  <div className="absolute inset-x-8 bottom-8 hidden h-px bg-white/12 md:block" />
                  <div className="absolute inset-y-8 left-1/2 hidden w-px bg-white/10 md:block" />
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-4 font-mono text-[8px] uppercase tracking-[0.22em] text-white/32">
                  <span>{mockStoryboardData.story_name}</span>
                  <span>{mockStoryboardData.total_shots} cuts</span>
                  <span>{mockStoryboardData.total_duration}</span>
                  <span>{processingShotNumber ? `Processing ${processingShotNumber}` : 'Preview locked'}</span>
                </div>
              </div>
            </aside>
          </div>
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
                    <button
                      onClick={() => setActiveNodeLabel(node.label)}
                      className={`relative z-10 mt-5 h-7 w-7 border transition-colors ${activeNodeLabel === node.label ? 'border-[#111111] bg-[#111111]' : 'border-[#111111] bg-[#F7F4EF]'}`}
                    >
                      <span className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 ${activeNodeLabel === node.label ? 'bg-[#F7F4EF]' : 'bg-[#111111]'}`} />
                    </button>
                    <button
                      onClick={() => setActiveNodeLabel(node.label)}
                      className={`flex-1 border p-4 text-left shadow-[8px_8px_0_rgba(17,17,17,0.03)] transition-colors ${activeNodeLabel === node.label ? 'border-[#111111] bg-[#111111] text-[#F7F4EF]' : 'border-[#D8D1C7] bg-[#F7F4EF]/78 hover:border-[#111111]'}`}
                    >
                      <div className={`flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.2em] ${activeNodeLabel === node.label ? 'text-[#F7F4EF]/52' : 'text-[#8A8175]'}`}>
                        <span>{node.label}</span>
                        <span className={`border px-1.5 py-0.5 ${activeNodeLabel === node.label ? 'border-[#F7F4EF]/20 text-[#F7F4EF]' : 'border-[#111111]/20 text-[#111111]'}`}>{node.status}</span>
                      </div>
                      <div className="mt-3 text-sm font-semibold tracking-tight">{node.title}</div>
                      <div className={`mt-1 font-mono text-[10px] ${activeNodeLabel === node.label ? 'text-[#F7F4EF]/48' : 'text-[#8A8175]'}`}>{node.meta}</div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-[#D8D1C7] bg-[#F7F4EF]/70 p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#8A8175]">Selected Node</div>
                <div className="mt-2 text-sm font-semibold">{activeNode.title}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8A8175]">{activeNode.meta}</div>
              </div>
            </aside>
          )}

          <div className="flex-1">
            <FilmGridStoryboard
              data={mockStoryboardData}
              selectedShotNumber={selectedShotNumber}
              processingShotNumber={processingShotNumber}
              rebuiltShots={rebuiltShots}
              onSelectShot={handleSelectShot}
              onExecuteAction={handleExecuteShot}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
