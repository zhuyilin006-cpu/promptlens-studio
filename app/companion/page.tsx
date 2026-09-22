'use client';

import { useCallback, useRef, useState } from 'react';
import RoleSelect, { type StartPayload } from '@/components/companion/RoleSelect';
import CallScreen, { type Subtitle } from '@/components/companion/CallScreen';
import ControlBar from '@/components/companion/ControlBar';
import TextComposer from '@/components/companion/TextComposer';
import { ViduCompanionSession } from '@/lib/vidu/client';
import { DEFAULT_CALL_MODE } from '@/data/companionPersonas';
import type { SessionStatus } from '@/lib/vidu/types';

type Phase = 'select' | 'call';

export default function CompanionPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [statusDetail, setStatusDetail] = useState<string>();
  const [remoteLive, setRemoteLive] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);
  const [textOpen, setTextOpen] = useState(false);
  const [display, setDisplay] = useState({ name: '', image: '' });
  const [banner, setBanner] = useState<string>();

  const sessionRef = useRef<ViduCompanionSession | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const subIdRef = useRef(0);

  const addSubtitle = useCallback((text: string, role: 'user' | 'bot') => {
    subIdRef.current += 1;
    setSubtitles((prev) => [...prev, { id: subIdRef.current, text, role }]);
  }, []);

  const start = useCallback(
    async (p: StartPayload) => {
      setDisplay({ name: p.displayName, image: p.displayImage });
      setSubtitles([]);
      setBanner(undefined);
      setRemoteLive(false);
      setPhase('call');
      setStatus('creating');

      // 用户手势内申请麦克风/摄像头权限（失败则降级为只出）
      // 视频按 720p 申请，与 AliRTC 采集配置保持一致，避免被浏览器降到默认低分辨率
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video:
            DEFAULT_CALL_MODE === 'video'
              ? {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  frameRate: { ideal: 30 },
                }
              : false,
        });
        media.getTracks().forEach((t) => t.stop());
      } catch {
        setBanner('未获得麦克风权限，已降级为只听/文字模式');
      }

      const session = new ViduCompanionSession({
        onStatus: (s, d) => {
          setStatus(s);
          setStatusDetail(d);
        },
        getVideoEl: () => remoteVideoRef.current,
        onRemoteLive: () => setRemoteLive(true),
        onSubtitle: (text, role) => addSubtitle(text, role),
        onError: (msg) => setBanner(msg),
        onHangup: (msg) => setBanner(msg),
      });
      sessionRef.current = session;
      await session.start({
        call_mode: DEFAULT_CALL_MODE,
        model: 'vidu-s2',
        avatar: p.avatar,
      });
    },
    [addSubtitle],
  );

  const hangup = useCallback(async () => {
    await sessionRef.current?.hangup();
    sessionRef.current = null;
    setRemoteLive(false);
    setStatus('idle');
    setStatusDetail(undefined);
    setPhase('select');
  }, []);

  const toggleMic = useCallback(() => {
    setMicEnabled((prev) => {
      const next = !prev;
      sessionRef.current?.setMicEnabled(next);
      return next;
    });
  }, []);

  if (phase === 'select') {
    return (
      <main className="tech-bg relative min-h-[100dvh]">
        <div className="tech-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <RoleSelect onStart={start} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-[100dvh] w-full select-none">
      <CallScreen
        status={status}
        statusDetail={statusDetail}
        videoRef={remoteVideoRef}
        remoteLive={remoteLive}
        posterImage={display.image}
        displayName={display.name}
        subtitles={subtitles}
      />
      {banner && (
        <div className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+64px)] z-20 flex justify-center px-6">
          <div className="rounded-full bg-black/55 px-4 py-2 text-center text-xs text-white backdrop-blur-md">
            {banner}
          </div>
        </div>
      )}
      <ControlBar
        micEnabled={micEnabled}
        onToggleMic={toggleMic}
        onInterrupt={() => sessionRef.current?.interrupt()}
        onOpenText={() => setTextOpen(true)}
        onHangup={hangup}
        disabled={status !== 'live'}
      />
      <TextComposer
        open={textOpen}
        onClose={() => setTextOpen(false)}
        onSend={(t) => {
          sessionRef.current?.sendText(t);
          setTextOpen(false);
        }}
      />
    </main>
  );
}
