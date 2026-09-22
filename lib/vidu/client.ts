// 会话编排器：串联 创建会话 → WS 信令(conn_init) → AliRTC 入会。
// 无密钥或强制 Mock 时走占位流程，保证移动端 UI 全流程可演示。
import { getClientConfig, VIDU_SESSION_API, VIDU_WS_PROXY_PATH } from './config';
import { joinRtc, type RtcHandle } from './rtc';
import {
  buildConnInit,
  buildHangup,
  buildInterrupt,
  buildText,
  describeHangup,
  encode,
  parseInbound,
} from './messages';
import type {
  CreateLiveRequest,
  CreateLiveResponse,
  SessionStatus,
} from './types';

export interface SessionCallbacks {
  onStatus: (status: SessionStatus, detail?: string) => void;
  /** 返回用于渲染数字人视频的 <video> 元素（懒取，接入时读取） */
  getVideoEl?: () => HTMLVideoElement | null;
  onRemoteLive?: () => void;
  onSubtitle?: (text: string, role: 'user' | 'bot', final: boolean) => void;
  onError: (message: string) => void;
  onHangup: (message: string) => void;
  /**
   * 会话创建成功后回传形象资产 id（仅首次用 image_uri 创建时才有）。
   * 调用方应缓存它，后续同一形象的通话直接传 avatar.id，避免重复上传图片。
   */
  onAvatarId?: (avatarId: string) => void;
  /**
   * 使用 avatar.id 创建会话失败（通常是形象资产已过 90 天被删除）时触发。
   * 调用方应清掉本地缓存的 id，下次自动回退到重新上传图片。
   */
  onAvatarIdInvalid?: () => void;
}

export class ViduCompanionSession {
  private cb: SessionCallbacks;
  private ws: WebSocket | null = null;
  private rtc: RtcHandle | null = null;
  private liveId = '';
  private mock = false;
  private ended = false;
  private micEnabled = true;

  constructor(cb: SessionCallbacks) {
    this.cb = cb;
  }

  async start(req: CreateLiveRequest): Promise<void> {
    this.ended = false;
    const { forceMock } = getClientConfig();
    this.cb.onStatus('creating', '正在创建会话');

    if (forceMock) {
      return this.startMock(req);
    }

    let data: CreateLiveResponse;
    try {
      const res = await fetch(VIDU_SESSION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.status === 501) {
        // 服务端未配置密钥 → Mock
        return this.startMock(req);
      }
      const body = await res.json();
      if (!res.ok) {
        // 用形象资产 id 创建失败 → 多半是资产已过期被删，通知调用方清缓存以便下次重传
        if (req.avatar.id) this.cb.onAvatarIdInvalid?.();
        this.cb.onError(body?.message || `创建会话失败(${res.status})`);
        this.cb.onStatus('error');
        return;
      }
      data = body as CreateLiveResponse;
    } catch (e) {
      this.cb.onError((e as Error)?.message || '创建会话请求失败');
      this.cb.onStatus('error');
      return;
    }

    this.liveId = data.live_id;
    // 形象资产 id 回传：前端缓存后，下次同一形象无需再传图
    if (data.avatar_id) this.cb.onAvatarId?.(data.avatar_id);
    await this.connectWs(data, req);
  }

  private connectWs(data: CreateLiveResponse, req: CreateLiveRequest): Promise<void> {
    return new Promise((resolve) => {
      this.cb.onStatus('connecting', '正在建立信令连接');
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${proto}://${location.host}${VIDU_WS_PROXY_PATH}?live_id=${encodeURIComponent(this.liveId)}`;
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        this.cb.onStatus('handshaking', '正在握手');
        ws.send(encode(buildConnInit(this.liveId)));
      };
      ws.onmessage = (ev) => this.onWsMessage(String(ev.data), data, req);
      ws.onerror = () => {
        if (!this.ended) this.cb.onError('信令连接异常');
      };
      ws.onclose = () => {
        if (!this.ended) {
          this.cb.onStatus('ended');
          this.cb.onHangup('连接已关闭');
        }
        resolve();
      };
    });
  }

  private async onWsMessage(raw: string, data: CreateLiveResponse, req: CreateLiveRequest) {
    const msg = parseInbound(raw);
    if (!msg?.payload) return;
    const p = msg.payload;

    if (p.conn_init_ack) {
      if (p.conn_init_ack.success) {
        await this.joinMedia(data, req);
      } else {
        this.cb.onError(p.conn_init_ack.message || '握手失败');
        this.cb.onStatus('error');
      }
      return;
    }
    if (p.subtitle) {
      this.cb.onSubtitle?.(p.subtitle.text, p.subtitle.role || 'bot', p.subtitle.final ?? true);
      return;
    }
    if (p.hangup) {
      this.ended = true;
      this.cb.onStatus('ended');
      this.cb.onHangup(describeHangup(p.hangup.hangup_reason));
      this.teardown();
      return;
    }
    if (p.error) {
      this.cb.onError(p.error.message || '服务端错误');
    }
  }

  private async joinMedia(data: CreateLiveResponse, req: CreateLiveRequest) {
    this.cb.onStatus('joining', '正在接入音视频');
    try {
      this.rtc = await joinRtc({
        rtc: data.rtc,
        mode: req.call_mode,
        videoEl: this.cb.getVideoEl?.() ?? null,
        onRemoteLive: () => this.cb.onRemoteLive?.(),
        onError: (e) => this.cb.onError(e.message),
      });
      this.rtc.setMicEnabled(this.micEnabled);
      this.cb.onStatus('live', '通话中');
    } catch (e) {
      this.cb.onError((e as Error)?.message || '接入音视频失败');
      this.cb.onStatus('error');
    }
  }

  sendText(text: string) {
    const t = text.trim();
    if (!t) return;
    this.cb.onSubtitle?.(t, 'user', true);
    if (this.mock) {
      window.setTimeout(() => this.cb.onSubtitle?.(`我在听：「${t}」，多和我说说吧。`, 'bot', true), 600);
      return;
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(encode(buildText(this.liveId, t)));
    }
  }

  interrupt() {
    if (this.mock) return;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(encode(buildInterrupt(this.liveId)));
    }
  }

  setMicEnabled(enabled: boolean) {
    this.micEnabled = enabled;
    this.rtc?.setMicEnabled(enabled);
  }

  async hangup() {
    this.ended = true;
    if (!this.mock && this.ws?.readyState === WebSocket.OPEN) {
      try { this.ws.send(encode(buildHangup(this.liveId))); } catch { /* noop */ }
    }
    this.teardown();
    this.cb.onStatus('ended');
    this.cb.onHangup('你已结束通话');
  }

  private teardown() {
    try { this.rtc?.leave(); } catch { /* noop */ }
    try { this.ws?.close(); } catch { /* noop */ }
    this.rtc = null;
    this.ws = null;
  }

  // ---- Mock 模式 ----
  private async startMock(req: CreateLiveRequest) {
    this.mock = true;
    this.liveId = 'mock-' + Math.floor(performance.now());
    this.cb.onStatus('connecting', 'Mock 模式：模拟连接');
    window.setTimeout(() => {
      if (this.ended) return;
      this.cb.onStatus('live', 'Mock 通话中');
      const greeting = req.avatar.greeting_instruction
        ? '（Mock）你来啦，我一直在这儿等你。'
        : '（Mock）嗨，我是你的情感搭子，今天过得怎么样？';
      this.cb.onSubtitle?.(greeting, 'bot', true);
    }, 900);
  }
}
