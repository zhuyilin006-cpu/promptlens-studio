'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CreditBadgeProps {
  balance: number;
}

export default function CreditBadge({ balance }: CreditBadgeProps) {
  return (
    <div className="flex items-center gap-2 border border-[#D8D1C7] bg-[#F7F4EF]/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8175] select-none">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 bg-emerald-500" />
      </span>
      <span>Compute</span>
      <span className="text-[#C2B6A7]">/</span>
      <motion.span
        key={balance}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="font-semibold text-[#111111]"
      >
        {balance.toLocaleString()} CRS
      </motion.span>
    </div>
  );
}