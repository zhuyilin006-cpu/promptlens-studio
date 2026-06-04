'use client';

import React from 'react';

interface CreditBadgeProps {
  balance: number;
}

export default function CreditBadge({ balance }: CreditBadgeProps) {
  return (
    <div className="relative group cursor-default">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-sm hover:border-amber-300 transition-colors">
        <span className="text-[10px] font-mono text-amber-600 tracking-wider">CRS</span>
        <span className="text-[11px] font-semibold text-amber-700 tabular-nums">
          {balance.toLocaleString()}
        </span>
        <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="absolute right-0 top-full mt-1 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="text-[9px] font-mono text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-sm shadow-sm">
          云端算力余额
        </div>
      </div>
    </div>
  );
}