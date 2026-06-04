'use client';

import React, { useState } from 'react';
import FilmGridStoryboard from '@/components/tvc/FilmGridStoryboard';
import CreditBadge from '@/components/tvc/CreditBadge';
import { mockStoryboardData } from '@/data/mockStoryboard';

export default function RunningHubInspiredPage() {
  // 核心状态机：控制右侧算力余额与顶层双轨 Tab 切换
  const [credits, setCredits] = useState(48250);
  const [currentTab, setCurrentTab] = useState<'app' | 'workflow'>('app');

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] flex flex-col text-[#111111] relative">
      {/* 1. 全局虚化光学测距背景网格线 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

      {/* 2. 顶层高级感悬浮导航栏 */}
      <nav className="w-full h-14 border-b border-[#E5E5E5] px-8 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-50 select-none">
        <div className="flex items-center gap-8">
          <span className="font-serif italic text-lg font-bold tracking-wider">PromptLens Studio ®</span>
          <div className="flex items-center gap-6 text-[10px] font-mono tracking-[0.2em] text-gray-400">
            <button 
              onClick={() => setCurrentTab('app')} 
              className={`hover:text-[#111111] transition-colors py-4 ${currentTab === 'app' ? 'text-[#111111] font-semibold border-b border-[#111111]' : ''}`}
            >
              01 / APPLICATION CANVAS
            </button>
            <button 
              onClick={() => setCurrentTab('workflow')}
              className={`hover:text-[#111111] transition-colors py-4 ${currentTab === 'workflow' ? 'text-[#111111] font-semibold border-b border-[#111111]' : ''}`}
            >
              02 / COMFYFLOW GRAPH
            </button>
          </div>
        </div>

        {/* 右侧：云端计费徽章与部署网关 */}
        <div className="flex items-center gap-4">
          <CreditBadge balance={credits} />
          <div className="text-[10px] font-mono bg-[#111111] text-white px-3 py-1 hover:bg-gray-800 transition-colors cursor-pointer tracking-wider">
            LIVE DEPLOY
          </div>
        </div>
      </nav>

      {/* 3. 双轨无边框交互视窗 */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative">
        
        {/* 左轨：硬核 ComfyUI 节点管线参数区 */}
        {currentTab === 'workflow' && (
          <div className="w-full lg:w-[35%] border-r border-[#E5E5E5] bg-[#F5F5F3]/60 backdrop-blur-xs p-6 font-mono text-[11px] flex flex-col justify-between border-t lg:border-t-0">
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 uppercase tracking-widest text-[9px] mb-2">Active Checkpoint Node</div>
                <div className="p-3 bg-white border border-gray-200 font-medium">
                  📥 Load: <span className="text-amber-800">Lovart_Fashion_v1.0.safetensors</span>
                </div>
              </div>
              <div>
                <div className="text-gray-400 uppercase tracking-widest text-[9px] mb-2">Prompt Quantization Matrix</div>
                <div className="p-3 bg-white border border-gray-200 text-gray-600 space-y-1">
                  <div>• Cloth Folds Weight: <span className="text-blue-600">1.2</span></div>
                  <div>• Specular Highlights: <span className="text-blue-600">Active</span></div>
                  <div>• SSS Skin Texture: <span className="text-blue-600">0.85</span></div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 uppercase tracking-widest text-[9px] mb-2">KSampler Logic</div>
                <div className="p-3 bg-white border border-gray-200 text-emerald-800">
                  ⚙️ Euler a / 30 Steps / CFG 6.5
                </div>
              </div>
            </div>
            <div className="text-[9px] text-gray-400 tracking-wider pt-6 border-t border-gray-200">
              * RUNNINGHUB KNOT CONNECTED PROPERLY.
            </div>
          </div>
        )}

        {/* 右轨：大牌 Lookbook 质感的高级时尚电商故事板画布 */}
        <div className="flex-1 bg-[#FBFBFA]">
          <FilmGridStoryboard 
            data={mockStoryboardData} 
            // 当触发局部重绘或生成时，自动扣除 12 点算力 CRS，数字发生丝滑刷新
            onExecuteAction={() => setCredits(prev => prev - 12)} 
          />
        </div>
      </div>
    </div>
  );
}