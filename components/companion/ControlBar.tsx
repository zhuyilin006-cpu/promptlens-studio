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
    <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-4 px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6">
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
        className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-rose-500 text-2xl text-white shadow-lg transition active:scale-95"
      >
        📞
      </button>
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
      className={`flex h-14 w-14 flex-none flex-col items-center justify-center rounded-full text-xl backdrop-blur-md transition active:scale-95 disabled:opacity-40 ${
        active ? 'bg-white text-slate-800' : 'bg-white/25 text-white'
      }`}
    >
      {children}
    </button>
  );
}
