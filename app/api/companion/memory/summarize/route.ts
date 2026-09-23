import { NextResponse } from 'next/server';

// 可选的「记忆提炼」接口。
// 配置了文本大模型就用模型把一次通话压缩成高质量记忆；没配置就返回 not-configured，
// 由前端回退到规则化提炼。这样零配置也能跑，给了 key 自动升级。

const MAX_LINES = 400;

function configured() {
  const apiKey = process.env.MEMORY_LLM_API_KEY;
  const baseUrl = process.env.MEMORY_LLM_BASE_URL;
  if (!apiKey || !baseUrl) return null;
  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ''),
    model: process.env.MEMORY_LLM_MODEL || 'deepseek-chat',
  };
}

export async function POST(request: Request) {
  let body: {
    lines?: { role: 'user' | 'bot'; text: string }[];
    relationLabel?: string;
    nickname?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const lines = (body.lines || []).slice(-MAX_LINES);
  if (!lines.length) {
    return NextResponse.json({ ok: false, reason: 'empty' }, { status: 400 });
  }

  const cfg = configured();
  if (!cfg) {
    return NextResponse.json({ ok: false, reason: 'not-configured' });
  }

  const transcript = lines
    .map((l) => `${l.role === 'user' ? '用户' : '数字人'}：${l.text}`)
    .join('\n')
    .slice(0, 8000);

  const system = [
    '你是记忆提炼助手。把一段情感陪伴对话压缩成给数字人看的记忆。',
    '输出纯文本，不要 markdown，分成两部分：',
    '1) 「事实」：用户明确透露的、长期稳定的信息（姓名、喜好、经历、在意的人事）。每条一行，以「TA 」开头。没有就写「无」。',
    '2) 「摘要」：一段 80 字以内的话，说清这次聊了什么、用户情绪如何、有什么未完成的心事。',
    '不要臆造对话里没有的内容。不要写评价和建议。',
  ].join('\n');

  const user = [
    body.relationLabel ? `关系：${body.relationLabel}` : '',
    body.nickname ? `用户对数字人的称呼：${body.nickname}` : '',
    '对话如下：',
    transcript,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.3,
        max_tokens: 600,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, reason: `upstream-${res.status}` });
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return NextResponse.json({ ok: false, reason: 'empty-response' });
    return NextResponse.json({ ok: true, text: text.slice(0, 1500) });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      reason: (e as Error)?.message || 'request-failed',
    });
  }
}
