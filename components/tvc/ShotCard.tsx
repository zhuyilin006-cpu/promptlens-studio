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

  const handleRebuild = () => {
    onAction(); // 触发扣减算力 CRS 的状态联动
    alert(`正在调用 Lovart API 重新量化渲染第 ${shot.shot_number} 镜关键帧...`);
  };

  return (
    <motion.div 
      className="flex flex-col border border-[#E5E5E5] bg-white p-1.5 transition-colors duration-300 hover:border-[#111111] group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* 16:9 白底黑边分镜渲染监视器 */}
      <div 
        className="relative aspect-[16/9] bg-[#111111] overflow-hidden flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="text-[9px] font-mono text-white/15 tracking-[0.2em] uppercase select-none">
          LOVART COMPUTE RENDER FRAME #{shot.shot_number}
        </span>

        {/* 光学测距十字线 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-3 h-[1px] bg-white absolute" />
          <div className="h-3 w-[1px] bg-white absolute" />
        </div>

        {/* 鼠标悬停：高级控制浮层 */}
        <AnimatePresence>
          {hovered && (
            <motion.div 
              className="absolute inset-0 bg-[#FBFBFA]/95 p-4 flex flex-col justify-between border border-[#111111] select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-[8px] font-mono text-gray-400 tracking-widest uppercase">
                Aesthetic Quantization Locked
              </div>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={handleRebuild}
                  className="w-full py-1 text-[10px] bg-[#111111] text-white font-mono rounded-none hover:bg-gray-800 transition-colors"
                >
                  🔄 局部重绘此分镜
                </button>
                {shot.midjourney_shot_prompt && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shot.midjourney_shot_prompt || '');
                      alert('专属'去AI感'高阶提示词已无损复制至剪贴板');
                    }}
                    className="w-full py-1 text-[9px] border border-gray-300 font-mono text-[#111111] bg-white rounded-none hover:bg-gray-50 transition-colors"
                  >
                    📋 复制通用大模型提示词
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 下半部分：高密度、大牌杂志版式技术表格 */}
      <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between">
        <div>
          {/* 顶置元数据信息 */}
          <div className="flex justify-between items-center font-mono text-[10px] text-gray-400 mb-1.5 select-none">
            <span>SHOT / {shot.shot_number}</span>
            <span className="text-[#111111] font-semibold">{shot.time_code}</span>
          </div>
          
          <h3 className="text-xs font-semibold tracking-tight text-[#111111] mb-1.5 select-none">
            {shot.shot_title}
          </h3>
          
          {/* 技术标签流 */}
          <div className="flex flex-wrap gap-1.5 mb-3 select-none">
            <span className="text-[9px] font-mono uppercase bg-[#F5F5F3] text-gray-500 px-1.5 py-0.5 rounded-none">
              🎬 {shot.camera_movement}
            </span>
            <span className="text-[9px] font-mono uppercase bg-[#F5F5F3] text-gray-500 px-1.5 py-0.5 rounded-none">
              ⚡ {shot.transition}
            </span>
          </div>

          {/* 细腻的去AI感画面描述解构 */}
          <p className="text-[11px] text-gray-500 leading-relaxed font-sans line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
            {shot.visual_description}
          </p>
        </div>
        
        {/* 音效/旁白专属注脚 */}
        <div className="mt-4 pt-2 border-t border-gray-100 text-[10px] text-amber-900 italic font-sans leading-relaxed">
          {shot.audio_sfx}
        </div>
      </div>
    </motion.div>
  );
}