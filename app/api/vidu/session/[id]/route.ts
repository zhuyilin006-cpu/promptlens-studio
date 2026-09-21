import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/vidu/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 查询单个 Live 会话状态与账单 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const liveId = params?.id;
  if (!liveId) {
    return NextResponse.json({ code: 400, reason: 'BAD_REQUEST', message: '缺少 live_id' }, { status: 400 });
  }

  const { apiKey, httpHost, hasKey } = getServerConfig();
  if (!hasKey) {
    return NextResponse.json(
      { code: 501, reason: 'NO_API_KEY', message: '服务端未配置 VIDU_API_KEY' },
      { status: 501 },
    );
  }

  try {
    const upstream = await fetch(`https://${httpHost}/live/v1/lives/${liveId}`, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    const raw = await upstream.json().catch(() => ({}));
    return NextResponse.json(raw, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { code: 502, reason: 'UPSTREAM_ERROR', message: (err as Error)?.message || '请求上游失败' },
      { status: 502 },
    );
  }
}
