import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/vidu/config';
import type { CreateLiveRequest, CreateLiveResponse } from '@/lib/vidu/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function badRequest(message: string) {
  return NextResponse.json({ code: 400, reason: 'BAD_REQUEST', message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: CreateLiveRequest;
  try {
    body = (await req.json()) as CreateLiveRequest;
  } catch {
    return badRequest('请求体不是合法 JSON');
  }

  if (body?.call_mode !== 'video' && body?.call_mode !== 'audio') {
    return badRequest('call_mode 必须为 video 或 audio');
  }
  if (!body?.avatar?.persona?.trim()) {
    return badRequest('avatar.persona 必填');
  }
  if (!body.avatar.image_uri && !body.avatar.id) {
    return badRequest('avatar.image_uri 与 avatar.id 需二选一');
  }

  const { apiKey, httpHost, hasKey } = getServerConfig();

  // 无密钥：返回 501，前端据此进入 Mock 模式
  if (!hasKey) {
    return NextResponse.json(
      {
        code: 501,
        reason: 'NO_API_KEY',
        message: '服务端未配置 VIDU_API_KEY，请在 .env.local 配置后重启，或使用 Mock 模式体验。',
      },
      { status: 501 },
    );
  }

  try {
    const upstream = await fetch(`https://${httpHost}/live/v1/lives`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const raw = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(raw, { status: upstream.status });
    }

    // 规范化：live.id / rtc / token_expire_at，int64 一律字符串化
    const liveId = String(raw?.live?.id ?? raw?.live_id ?? raw?.id ?? '');
    const rtc = raw?.rtc ?? {};
    const normalized: CreateLiveResponse = {
      live_id: liveId,
      rtc: {
        token: String(rtc.token ?? ''),
        user_id: String(rtc.user_id ?? rtc.uid ?? ''),
        channel: rtc.channel ? String(rtc.channel) : undefined,
        app_id: rtc.app_id ? String(rtc.app_id) : undefined,
        ...rtc,
      },
      token_expire_at: raw?.token_expire_at ? String(raw.token_expire_at) : undefined,
      call_mode: body.call_mode,
      raw,
    };

    if (!normalized.live_id || !normalized.rtc.token) {
      return NextResponse.json(
        { code: 502, reason: 'BAD_UPSTREAM', message: '上游返回缺少 live_id 或 rtc.token', metadata: raw },
        { status: 502 },
      );
    }

    return NextResponse.json(normalized);
  } catch (err) {
    return NextResponse.json(
      { code: 502, reason: 'UPSTREAM_ERROR', message: (err as Error)?.message || '请求上游失败' },
      { status: 502 },
    );
  }
}
