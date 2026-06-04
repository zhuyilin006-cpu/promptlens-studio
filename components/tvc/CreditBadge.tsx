'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CreditBadgeProps {
  balance: number;
}

export default function CreditBadge({ balance }: CreditBadgeProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1 bg-white border border-[#E5E5E5] font-mono text-[10px] tracking-wider text-gray-500 select-none">
      {/* 算力节点健康呼吸灯 */}
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
      </span>
      <span>LOVART COMPUTE:</span>
      <motion.span 
        key={balance}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="font-bold text-[#111111]"
      >
        {balance.toLocaleString()} CRS
      </motion.span>
    </div>
  );
}