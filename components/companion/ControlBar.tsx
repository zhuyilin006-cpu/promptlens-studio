'use client';

export default function ControlBar({
  micEnabled,
  onToggleMic,
  onInterrupt,
  onOpenText,
  onHangup,
  disabled,
}: {
  micEnabled: boolean;
  onToggleMic: () => void;
  onInterrupt: () => void;
  onOpenText: () => void;
  onHangup: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6">
      <div className="glass-dark flex items-center gap-3 rounded-full px-4 py-3">
        <CircleBtn label={micEnabled ? '静音' : '取消静音'} active={!micEnabled} onClick={onToggleMic} disabled={disabled}>
          {micEnabled ? '🎙️' : '🔇'}
        </CircleBtn>
        <CircleBtn label="打断" onClick={onInterrupt} disabled={disabled}>
          ✋
        </CircleBtn>
        <CircleBtn label="文字" onClick={onOpenText} disabled={disabled}>
          💬
        </CircleBtn>
        <button
          aria-label="挂断"
          onClick={onHangup}
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-2xl text-white shadow-[0_0_22px_rgba(244,63,94,0.5)] transition active:scale-95"
        >
          📞
        </button>
      </div>
    </div>
  );
}

function CircleBtn({
  children,
  label,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 w-14 flex-none flex-col items-center justify-center rounded-full text-xl transition active:scale-95 disabled:opacity-40 ${
        active
          ? 'bg-cyan-400 text-slate-900 shadow-[0_0_16px_rgba(34,211,238,0.5)]'
          : 'border border-white/10 bg-white/10 text-white'
      }`}
    >
      {children}
    </button>
  );
}
