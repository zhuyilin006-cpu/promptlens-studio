'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function TextComposer({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-end bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full rounded-t-3xl border-t border-white/10 bg-[#0a0e17]/95 p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="flex items-end gap-2">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder="说点什么…"
                className="input max-h-32 flex-1 resize-none"
              />
              <button
                onClick={submit}
                className="flex-none rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_16px_rgba(34,211,238,0.35)] active:scale-95"
              >
                发送
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
