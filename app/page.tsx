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
        <section className="border-b border-[#111111]/10 px-4 py-5 lg:px-8 lg:py-8">
          <div className="grid min-h-[34rem] overflow-hidden border border-[#111111]/12 bg-[#EDE5D8] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="hero-noise corner-frame flex flex-col justify-between p-6 text-[#111111] lg:p-10">
              <div>
                <div className="mb-8 flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-[#7C7165]">
                  <span className="border border-[#111111]/20 bg-[#F7F4EF]/60 px-2 py-1">RunningHub split UI</span>
                  <span className="h-px w-12 bg-[#111111]/45" />
                  <span>Lovart cinematic protocol</span>
                </div>
                <h1 className="max-w-5xl font-serif text-6xl font-light leading-[0.82] tracking-[-0.065em] text-[#111111] md:text-8xl xl:text-9xl">
                  Visual command desk for AI fashion films.
                </h1>
                <p className="mt-8 max-w-2xl text-sm leading-7 text-[#62594F] md:text-base">
                  Convert prompt strategy, node workflow and frame-level rebuild controls into one restrained production surface for cinematic storyboard operations.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 border border-[#111111]/12 bg-[#F7F4EF]/72 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8175] md:grid-cols-4">
                {[
                  ['MODE', currentTab === 'app' ? 'CANVAS' : 'GRAPH'],
                  ['NODE', activeNode.status],
                  ['SHOT', selectedShotNumber || 'NONE'],
                  ['CREDIT', `${credits.toLocaleString()} CRS`],
                ].map(([label, value], index) => (
                  <div key={label} className={`p-3 ${index < 3 ? 'border-b border-[#111111]/10 md:border-b-0 md:border-r' : ''}`}>
                    <span className="block text-[8px] text-[#A49A8F]">{label}</span>
                    <strong className="mt-2 block text-[#111111]">{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative overflow-hidden bg-[#111111] p-5 text-[#F7F4EF] console-glow lg:p-7">
              <div className="absolute inset-0 scanlines opacity-60" />
              <div className="absolute inset-0 studio-grid opacity-[0.07]" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4 font-mono text-[9px] uppercase tracking-[0.24em] text-white/42">
                  <span>Production Monitor</span>
                  <span className="flex items-center gap-2 text-emerald-300"><span className="h-1.5 w-1.5 bg-emerald-400" /> Online</span>
                </div>

                <div className="relative mb-6 aspect-[16/10] border border-white/12 bg-black/35 p-4">
                  <div className="absolute left-3 top-3 h-5 w-5 border-l border-t border-white/35" />
                  <div className="absolute right-3 top-3 h-5 w-5 border-r border-t border-white/35" />
                  <div className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-white/35" />
                  <div className="absolute bottom-3 right-3 h-5 w-5 border-b border-r border-white/35" />
                  <div className="flex h-full flex-col justify-between">
                    <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/35">RunningHub Node Graph</div>
                    <div className="mx-auto grid w-[82%] grid-cols-2 gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/62">
                      {workflowNodes.map((node) => (
                        <button
                          key={node.label}
                          onClick={() => setActiveNodeLabel(node.label)}
                          className={`border p-3 text-left transition-colors ${activeNodeLabel === node.label ? 'border-white/55 bg-white/[0.12] text-white' : 'border-white/12 bg-white/[0.03] hover:border-white/32'}`}
                        >
                          <div className="mb-2 text-white/28">{node.label}</div>
                          <div className="truncate text-white/80">{node.status}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.24em] text-white/28">
                      <span>{mockStoryboardData.story_name}</span>
                      <span>{processingShotNumber ? `PROCESSING ${processingShotNumber}` : mockStoryboardData.total_duration}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 border border-white/10 bg-white/[0.03] p-4">
                  <div className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/28">Active Node Detail</div>
                  <div className="mt-2 text-sm font-semibold text-white/86">{activeNode.title}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/38">{activeNode.meta}</div>
                </div>

                <div className="mt-auto grid grid-cols-2 border border-white/10 font-mono text-[9px] uppercase tracking-[0.2em] text-white/42">
                  {[
                    ['PIPELINE', 'ACTIVE'],
                    ['CUTS', `${mockStoryboardData.total_shots}`],
                    ['SELECTED', selectedShotNumber || 'NONE'],
                    ['REBUILT', `${rebuiltShots.length}`],
                  ].map(([label, value]) => (
                    <div key={label} className="border border-white/10 p-4">
                      <span className="block text-[8px] text-white/25">{label}</span>
                      <strong className="mt-2 block font-serif text-2xl font-light italic text-[#F7F4EF]">{value}</strong>
                    </div>
                  ))}
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
