'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import RoleSelect, { type StartPayload } from '@/components/companion/RoleSelect';
import CallScreen, { type Subtitle } from '@/components/companion/CallScreen';
import ControlBar from '@/components/companion/ControlBar';
import TextComposer from '@/components/companion/TextComposer';
import { ViduCompanionSession } from '@/lib/vidu/client';
import { getCompanion, patchCompanion } from '@/lib/companion/history';
import { clearPresetAvatar, writePresetAvatar } from '@/lib/companion/presetAvatar';
import { emptyMemory, mergeMemory, parseLlmMemory } from '@/lib/companion/memory';
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
  // 字幕与通话计时用 ref 同步，挂断回调里才能读到最新值
  const subtitlesRef = useRef<Subtitle[]>([]);
  const callStartRef = useRef(0);
  const companionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    subtitlesRef.current = subtitles;
  }, [subtitles]);

  const addSubtitle = useCallback((text: string, role: 'user' | 'bot') => {
    subIdRef.current += 1;
    setSubtitles((prev) => [...prev, { id: subIdRef.current, text, role }]);
  }, []);

  /**
   * 挂断后把这次通话沉淀进长期记忆。
   * 先尝试服务端的大模型提炼，没配置就静默回退到规则化提炼。
   */
  const persistMemory = useCallback(async () => {
    const id = companionIdRef.current;
    if (!id) return;
    const lines = subtitlesRef.current
      .filter((s) => s.text && s.text.trim())
      .map((s) => ({ role: s.role, text: s.text }));
    if (!lines.length) return;

    const durationMs = callStartRef.current ? Date.now() - callStartRef.current : 0;

    let summary: string | undefined;
    let extraFacts: string[] | undefined;
    try {
      const res = await fetch('/api/companion/memory/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      });
      if (res.ok) {
        const d = (await res.json()) as { ok?: boolean; text?: string };
        if (d?.ok && d.text) {
          const parsed = parseLlmMemory(d.text);
          if (parsed.summary) summary = parsed.summary;
          if (parsed.facts.length) extraFacts = parsed.facts;
        }
      }
    } catch {
      /* 提炼失败不影响保存，走规则化 */
    }

    try {
      const rec = await getCompanion(id);
      const prev = rec?.memory ?? emptyMemory();
      const next = mergeMemory(prev, { lines, durationMs, summary, extraFacts });
      await patchCompanion(id, { memory: next });
    } catch {
      /* 记忆写回失败不影响本次使用 */
    }
  }, []);

  const start = useCallback(
    async (p: StartPayload) => {
      setDisplay({ name: p.displayName, image: p.displayImage });
      setSubtitles([]);
      subtitlesRef.current = [];
      callStartRef.current = 0;
      companionIdRef.current = p.companionId;
      setBanner(undefined);
      setRemoteLive(false);
      setPhase('call');
      setStatus('creating');

      // 用户手势内单独申请麦克风权限（不连带摄像头，避免摄像头不可用被误判成麦克风被拒）。
      // 情感陪聊无需推送本地摄像头，数字人视频从云端拉取。
      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic.getTracks().forEach((t) => t.stop());
      } catch {
        setBanner('麦克风权限被拒绝，请在浏览器权限设置中允许麦克风后重试（仍可用文字聊天）');
      }

      const session = new ViduCompanionSession({
        onStatus: (s, d) => {
          if (s === 'live' && !callStartRef.current) callStartRef.current = Date.now();
          setStatus(s);
          setStatusDetail(d);
        },
        getVideoEl: () => remoteVideoRef.current,
        onRemoteLive: () => setRemoteLive(true),
        onSubtitle: (text, role) => addSubtitle(text, role),
        onError: (msg) => setBanner(msg),
        onHangup: (msg) => setBanner(msg),
        // 首次用高清图创建成功后，Vidu 回传形象资产 id：写回本地记录，
        // 之后这个搭子开聊只发 id，不再上传图片。
        onAvatarId: (avatarId) => {
          if (p.presetId) writePresetAvatar(p.presetId, avatarId);
          if (!p.companionId) return;
          void patchCompanion(p.companionId, {
            avatarId,
            avatarIdAt: Date.now(),
          }).catch(() => {
            /* 写回失败不影响本次通话 */
          });
        },
        // 形象资产已过期（Vidu 90 天自动删除）→ 清掉缓存，下次自动回退到重新上传
        onAvatarIdInvalid: () => {
          if (p.presetId) clearPresetAvatar(p.presetId);
          if (p.companionId) {
            void patchCompanion(p.companionId, {
              avatarId: undefined,
              avatarIdAt: undefined,
            }).catch(() => {
              /* noop */
            });
          }
          setBanner('形象缓存已失效，请返回重新开始以重新上传形象图');
        },
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
    const duration = callStartRef.current ? Date.now() - callStartRef.current : 0;
    await persistMemory();
    callStartRef.current = 0;
    setRemoteLive(false);
    setStatus('idle');
    setStatusDetail(undefined);
    setPhase('select');
    if (duration > 0 && companionIdRef.current) {
      setBanner('这次聊天已经记下来了');
    }
  }, [persistMemory]);

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
