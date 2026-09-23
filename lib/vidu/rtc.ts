// AliRTC (ARTC) Web SDK 封装（客户端）。
// 通过 npm 包 aliyun-rtc-sdk 动态引入（避免 CDN 404），加入频道、发布麦克风(可选摄像头)、
// 订阅并渲染数字人远端音视频。API 依据 aliyun-rtc-sdk 官方类型定义。
import type { CallMode, RtcInfo } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RtcJoinOptions {
  rtc: RtcInfo;
  mode: CallMode;
  /** 渲染数字人视频的 <video> 元素 */
  videoEl: HTMLVideoElement | null;
  /** 远端首帧就绪回调 */
  onRemoteLive?: () => void;
  onError?: (err: Error) => void;
}

export interface RtcHandle {
  setMicEnabled: (enabled: boolean) => void;
  leave: () => Promise<void>;
}

export async function joinRtc(opts: RtcJoinOptions): Promise<RtcHandle> {
  const mod: any = await import('aliyun-rtc-sdk');
  const AliRtcEngine: any = mod.default || mod.AliRtcEngine || mod;

  const support = await AliRtcEngine.isSupported?.();
  if (support && support.support === false) {
    throw new Error('当前浏览器不支持实时音视频，请更换或升级浏览器');
  }

  const engine: any = AliRtcEngine.getInstance();
  const VideoTrack: any = AliRtcEngine.AliRtcVideoTrack || {};
  const CAMERA = VideoTrack.AliRtcVideoTrackCamera ?? 1;
  const StreamType: any = AliRtcEngine.AliRtcVideoStreamType || {};
  const HIGH = StreamType.AliRtcVideoStreamTypeHigh ?? 1;
  const LOW = StreamType.AliRtcVideoStreamTypeLow ?? 2;

  let bound = false;
  const bindRemoteVideo = (uid: string) => {
    if (!opts.videoEl) return;
    try {
      engine.setRemoteViewConfig(opts.videoEl, uid, CAMERA);
      // 优先拉取高清大流；同时显式订阅相机轨，避免只订阅到小流
      try { engine.setRemoteUserVideoStreamType?.(uid, HIGH); } catch { /* noop */ }
      try { engine.subscribeRemoteMediaStream?.(uid, CAMERA, true, true); } catch { /* noop */ }
      opts.videoEl.play?.().catch(() => {});
      if (!bound) {
        bound = true;
        opts.onRemoteLive?.();
      }
    } catch (e) {
      opts.onError?.(e as Error);
    }
  };

  // 官方推荐：订阅状态变为已订阅时绑定视图
  engine.on?.('videoSubscribeStateChanged', (uid: string, _old: any, next: any) => {
    // 3=已订阅；2=订阅中。字符串 'subscribed' 亦兼容
    if (next === 3 || next === 'subscribed' || next === 2) bindRemoteVideo(uid);
  });
  // 兜底：远端轨道可用 / 远端用户上线
  engine.on?.('remoteTrackAvailableNotify', (uid: string, _a: any, video: any) => {
    if (video) bindRemoteVideo(uid);
  });
  engine.on?.('remoteUserOnLineNotify', (uid: string) => {
    try { engine.setRemoteUserVideoStreamType?.(uid, HIGH); } catch { /* noop */ }
  });
  engine.on?.('remoteVideoAutoPlayFail', () => {
    opts.videoEl?.play?.().catch(() => {});
  });
  // 兜底保持高清：若 SDK 因弱网切到小流，待可用时再切回大流
  engine.on?.('subscribeStreamTypeChanged', (uid: string, _old: any, next: any) => {
    if (next === LOW || next === 'low') {
      try { engine.setRemoteUserVideoStreamType?.(uid, HIGH); } catch { /* noop */ }
    }
  });

  // 默认订阅所有远端音视频（数字人音视频），并默认取高清大流
  engine.setDefaultSubscribeAllRemoteAudioStreams?.(true);
  engine.setDefaultSubscribeAllRemoteVideoStreams?.(true);
  try { engine.setRemoteDefaultVideoStreamType?.(HIGH); } catch { /* noop */ }

  await engine.joinChannel(opts.rtc.token, opts.rtc.user_id);
  // 情感陪聊只需上行麦克风；本地摄像头不推送（数字人视频从云端拉取），
  // 这样也避免摄像头权限/占用问题拖累麦克风。
  await engine.publishLocalAudioStream?.(true);
  try { engine.setRemoteDefaultVideoStreamType?.(HIGH); } catch { /* noop */ }

  return {
    setMicEnabled: (enabled: boolean) => {
      try {
        engine.muteLocalMic?.(!enabled);
      } catch {
        /* noop */
      }
    },
    leave: async () => {
      try {
        await engine.leaveChannel?.();
        await engine.destroy?.();
      } catch {
        /* noop */
      }
    },
  };
}
