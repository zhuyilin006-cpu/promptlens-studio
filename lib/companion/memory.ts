'use client';

// 关系记忆：让数字陪伴人跨会话记住"你是谁"和"你们走到了哪一步"。
// 注入通道是 avatar.persona（Vidu 官方说明 persona 可用于定义 memory，上限 5 万字）。

export type RelationType = 'friend' | 'partner' | 'mentor' | 'family' | 'custom';

export interface RelationProfile {
  type: RelationType;
  /** 关系名，会写进人设，如「恋人」「导师」 */
  label: string;
  /** 数字人对用户的称呼 */
  nickname?: string;
  /** 关系背景故事，用户可自定义 */
  background?: string;
}

export interface MemoryFact {
  id: string;
  text: string;
  at: number;
}

/** 一次通话结束后沉淀下来的摘要 */
export interface MemoryDigest {
  at: number;
  turns: number;
  durationMs: number;
  summary: string;
}

export interface CompanionMemory {
  relation: RelationProfile;
  /** 关于用户的事实（从对话中提炼或用户手动补充） */
  facts: MemoryFact[];
  /** 近期话题 */
  topics: { text: string; at: number }[];
  /** 最近几次通话的摘要 */
  digests: MemoryDigest[];
  /** 最近几次通话的压缩原文，用于让数字人真正"接着上次聊" */
  transcripts: { at: number; text: string }[];
  stats: { sessions: number; totalMs: number; lastAt?: number };
}

export const RELATION_PRESETS: {
  type: RelationType;
  label: string;
  hint: string;
}[] = [
  { type: 'friend', label: '朋友', hint: '平等、放松，可以开玩笑' },
  { type: 'partner', label: '恋人', hint: '亲密、有专属感，语气更柔软' },
  { type: 'mentor', label: '导师', hint: '成熟、有见地，会引导你思考' },
  { type: 'family', label: '家人', hint: '天然亲近，关心日常琐碎' },
  { type: 'custom', label: '自定义', hint: '自己定义你们的关系' },
];

export function defaultRelation(): RelationProfile {
  return { type: 'friend', label: '朋友' };
}

export function emptyMemory(relation?: RelationProfile): CompanionMemory {
  return {
    relation: relation ?? defaultRelation(),
    facts: [],
    topics: [],
    digests: [],
    transcripts: [],
    stats: { sessions: 0, totalMs: 0 },
  };
}

// ---- 亲密度与关系阶段 ----

/**
 * 亲密度 0~100：由通话次数、累计时长、话题深度共同决定。
 * 刻意让"聊得久"比"聊得多"涨得慢，避免刷次数就能刷满。
 */
export function closenessOf(m: CompanionMemory): number {
  const s = m.stats;
  const bySessions = Math.min(36, s.sessions * 6);
  const byTime = Math.min(30, Math.floor(s.totalMs / 60000) * 1.0);
  const byDepth = Math.min(24, m.facts.length * 3 + m.digests.length * 2);
  const byRelation =
    m.relation.type === 'partner' || m.relation.type === 'family' ? 10 : 0;
  return Math.max(0, Math.min(100, Math.round(bySessions + byTime + byDepth + byRelation)));
}

export interface RelationStage {
  name: string;
  /** 写进人设的行为指引 */
  hint: string;
}

export function stageOf(closeness: number): RelationStage {
  if (closeness < 20) {
    return {
      name: '初识',
      hint: '你们还不算熟。保持礼貌和好奇，多问开放式问题，不要过度热情，也不要假装很了解 TA。',
    };
  }
  if (closeness < 45) {
    return {
      name: '熟悉',
      hint: '你们已经聊过几次，知道彼此的大致脾气。可以自然地说笑、给建议，偶尔提起 TA 提过的事。',
    };
  }
  if (closeness < 70) {
    return {
      name: '亲密',
      hint: '你们已经有默契。可以主动关心 TA 没说完的心事，用你们之间习惯的语气，适度表达在乎。',
    };
  }
  return {
    name: '挚友',
    hint: '你们彼此非常了解。可以直言不讳地点破 TA 的心事，用只有你们懂的方式说话，主动提起共同的经历。',
  };
}

// ---- 规则化提炼 ----
// 无 LLM 时的兜底：从字幕里抓事实、抓话题、压缩原文。
// 目标是"够用且不胡编"——抓不到就不写，绝不能臆造。

const FACT_PATTERNS: { re: RegExp; to: (m: RegExpExecArray) => string }[] = [
  { re: /我(?:叫|的名字是|是)\s*([^，。！？,.!?\s]{1,12})(?=[，。！？,.!?\s]|$)/g, to: (m) => `TA 叫「${m[1]}」` },
  { re: /我(?:喜欢|爱|很喜欢|超喜欢)\s*([^，。！？,.!?]{1,16})/g, to: (m) => `TA 喜欢${m[1]}` },
  { re: /我(?:讨厌|不喜欢|受不了|害怕|怕)\s*([^，。！？,.!?]{1,16})/g, to: (m) => `TA 不喜欢${m[1]}` },
  { re: /我(?:在|于)\s*([^，。！？,.!?]{1,20}?)(?:工作|上班|读书|上学|读研)/g, to: (m) => `TA 在${m[1]}` },
  { re: /我住(?:在)?\s*([^，。！？,.!?]{1,16})/g, to: (m) => `TA 住在${m[1]}` },
  { re: /我是(?:一个|一名|个)?\s*([^，。！？,.!?]{1,14}?)(?:人|生|族)/g, to: (m) => `TA 是${m[1]}` },
];

const STOPWORDS = new Set([
  '就是', '其实', '感觉', '觉得', '什么', '怎么', '因为', '所以', '然后',
  '现在', '这个', '那个', '一个', '我们', '你们', '他们', '自己', '可以',
]);

function pickTopics(userLines: string[], at: number): { text: string; at: number }[] {
  const out: string[] = [];
  for (const line of userLines) {
    const clean = line.replace(/[,.!?，。！？、；;：:]|\s+/g, ' ').trim();
    if (clean.length < 4 || clean.length > 30) continue;
    if (STOPWORDS.has(clean.slice(0, 2))) continue;
    if (out.some((t) => t.includes(clean.slice(0, 6)) || clean.includes(t.slice(0, 6)))) continue;
    out.push(clean);
    if (out.length >= 4) break;
  }
  return out.map((text) => ({ text, at }));
}

/** 从一次通话的字幕里规则化地提炼事实与话题 */
export function extractFromTranscript(
  lines: { role: 'user' | 'bot'; text: string }[],
  at: number,
): { facts: MemoryFact[]; topics: { text: string; at: number }[] } {
  const userLines = lines.filter((l) => l.role === 'user').map((l) => l.text);
  const facts: MemoryFact[] = [];
  const seen = new Set<string>();

  for (const line of userLines) {
    for (const { re, to } of FACT_PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        const text = to(m).trim();
        if (text && !seen.has(text)) {
          seen.add(text);
          facts.push({ id: `f_${at}_${facts.length}_${Math.random().toString(36).slice(2, 7)}`, text, at });
        }
        if (m[0].length === 0) re.lastIndex += 1;
      }
    }
  }
  return { facts, topics: pickTopics(userLines, at) };
}

function minutes(ms: number): string {
  const m = Math.round(ms / 60000);
  return m <= 0 ? '不到 1 分钟' : `${m} 分钟`;
}

/** 压缩一次通话的字幕：头尾都留，中间用省略号，保证看得出"聊了什么"和"聊到哪" */
export function compressTranscript(
  lines: { role: 'user' | 'bot'; text: string }[],
  at: number,
  maxChars = 1200,
): string {
  const seen = new Set<string>();
  const text = lines
    .filter((l) => {
      const k = `${l.role}:${l.text.trim()}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((l) => `${l.role === 'user' ? 'TA' : '我'}：${l.text}`)
    .join('\n');
  if (text.length <= maxChars) return text;
  const head = text.slice(0, Math.floor(maxChars * 0.45));
  const tail = text.slice(-Math.floor(maxChars * 0.5));
  return `${head}\n……（中间省略）……\n${tail}`;
}

/** 去掉完全重复的行（回声、重复提交会让字幕出现同句） */
function dedupe(texts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of texts) {
    const k = t.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

/** 规则化摘要：没有 LLM 时用它兜底 */
export function ruleSummary(
  lines: { role: 'user' | 'bot'; text: string }[],
  durationMs: number,
): string {
  const userLines = dedupe(lines.filter((l) => l.role === 'user').map((l) => l.text));
  const last = userLines.slice(-3).join('；');
  const first = userLines.slice(0, 2).join('；');
  const dur = minutes(durationMs);
  const head = first ? `这次聊了 ${dur}，主要说了「${first.slice(0, 40)}」` : `这次聊了 ${dur}`;
  const tail = last ? `，结束时提到「${last.slice(0, 60)}」` : '';
  return `${head}${tail}。`.slice(0, 200);
}

// ---- 记忆合并 ----

const MAX_FACTS = 40;
const MAX_TOPICS = 12;
const MAX_DIGESTS = 8;
const MAX_TRANSCRIPTS = 4;

/**
 * 解析大模型返回的记忆文本。约定输出含「事实」「摘要」两部分，
 * 解析失败时退化为把整段当摘要，绝不因为格式不符就丢掉内容。
 */
export function parseLlmMemory(text: string): { facts: string[]; summary: string } {
  const facts: string[] = [];
  let summary = '';
  let section: 'facts' | 'summary' | 'none' = 'none';

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.length < 12) {
      if (line.includes('事实')) { section = 'facts'; continue; }
      if (line.includes('摘要')) { section = 'summary'; continue; }
    }
    const body = line.replace(/^[-•*·\d.、]+\s*/, '').trim();
    if (!body || /^(无|没有)$/i.test(body)) continue;
    if (section === 'facts') {
      if (body.length <= 60) facts.push(body);
    } else {
      summary += summary ? ` ${body}` : body;
    }
  }
  return { facts, summary: summary.slice(0, 300) };
}

/** 把一次通话的结果并入长期记忆（去重、限量、按时间倒序） */
export function mergeMemory(
  prev: CompanionMemory,
  input: {
    lines: { role: 'user' | 'bot'; text: string }[];
    durationMs: number;
    summary?: string;
    /** 大模型额外提炼出的事实（有 LLM 时与规则结果合并） */
    extraFacts?: string[];
    at?: number;
  },
): CompanionMemory {
  const at = input.at ?? Date.now();
  const turns = input.lines.length;
  const { facts, topics } = extractFromTranscript(input.lines, at);

  for (const text of input.extraFacts || []) {
    const t = text.trim();
    if (t && !facts.some((f) => f.text === t)) {
      facts.push({ id: `fl_${at}_${facts.length}_${Math.random().toString(36).slice(2, 7)}`, text: t, at });
    }
  }

  const factMap = new Map<string, MemoryFact>();
  for (const f of [...prev.facts, ...facts]) {
    if (!factMap.has(f.text)) factMap.set(f.text, f);
    else if (f.at > factMap.get(f.text)!.at) factMap.set(f.text, { ...factMap.get(f.text)!, at: f.at });
  }
  const allFacts = Array.from(factMap.values()).sort((a, b) => b.at - a.at).slice(0, MAX_FACTS);

  const topicMap = new Map<string, { text: string; at: number }>();
  for (const t of [...topics, ...prev.topics]) {
    if (!topicMap.has(t.text)) topicMap.set(t.text, t);
  }
  const allTopics = Array.from(topicMap.values()).sort((a, b) => b.at - a.at).slice(0, MAX_TOPICS);

  const digest: MemoryDigest = {
    at,
    turns,
    durationMs: input.durationMs,
    summary: (input.summary || ruleSummary(input.lines, input.durationMs)).slice(0, 400),
  };

  return {
    relation: prev.relation,
    facts: allFacts,
    topics: allTopics,
    digests: [digest, ...prev.digests].slice(0, MAX_DIGESTS),
    transcripts: [
      { at, text: compressTranscript(input.lines, at) },
      ...prev.transcripts,
    ].slice(0, MAX_TRANSCRIPTS),
    stats: {
      sessions: prev.stats.sessions + 1,
      totalMs: prev.stats.totalMs + input.durationMs,
      lastAt: at,
    },
  };
}

// ---- 注入 persona / greeting ----

const PERSONA_BUDGET = 12000;

function dateLabel(at: number): string {
  const d = new Date(at);
  const diff = Date.now() - at;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return '今天';
  if (diff < 2 * day) return '昨天';
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 把记忆写进人设。关键点：以"你了解 TA"的口吻陈述，而不是命令它复述，
 * 否则数字人会生硬地背资料，非常出戏。
 */
export function buildPersona(basePersona: string, memory?: CompanionMemory | null): string {
  const base = (basePersona || '').trim();
  if (!memory) return base;

  const closeness = closenessOf(memory);
  const stage = stageOf(closeness);
  const rel = memory.relation;
  const blocks: string[] = [];

  const relationLines = [`你和 TA 是${rel.label}关系。`];
  if (rel.background) relationLines.push(rel.background.trim());
  if (rel.nickname) relationLines.push(`你平时叫 TA「${rel.nickname}」。`);
  relationLines.push(`目前你们的关系阶段是「${stage.name}」。${stage.hint}`);
  blocks.push(`【你们的关系】\n${relationLines.join('\n')}`);

  if (memory.facts.length) {
    blocks.push(
      `【你对 TA 的了解】\n${memory.facts
        .slice(0, 20)
        .map((f) => `- ${f.text}`)
        .join('\n')}`,
    );
  }

  const last = memory.digests[0];
  if (last) {
    blocks.push(`【上一次见面】${dateLabel(last.at)}，${last.summary}`);
  }

  if (memory.topics.length) {
    blocks.push(
      `【你们聊过的话题】\n${memory.topics
        .slice(0, 8)
        .map((t) => `- ${t.text}`)
        .join('\n')}`,
    );
  }

  // 最近一次的真实对话片段：这是让数字人"接得上话"最有效的部分
  const recent = memory.transcripts[0];
  if (recent) {
    blocks.push(
      `【上一次对话的片段（仅供你理解语境，不要复述）】\n${recent.text}`,
    );
  }

  blocks.push(
    [
      '【怎么用这些记忆】',
      '这些信息是你们共同经历的一部分，像真正的' + rel.label + '一样自然地运用它们。',
      '不要生硬地罗列、汇报或复述你"记得"什么，更不要说"我记得你上次说过"这类暴露记忆机制的话。',
      '合适的时机自然带出来就好，比如顺着话头关心一句后续。',
    ].join('\n'),
  );

  let injected = blocks.join('\n\n');
  // 预算保护：先砍最不重要的（话题 → 片段），最后才动摘要
  if (injected.length > PERSONA_BUDGET) {
    injected = injected.slice(0, PERSONA_BUDGET);
  }
  return `${base}\n\n${injected}`.trim();
}

/**
 * greeting_instruction 上限 200 字符，必须短小精悍。
 * 用 TA 的原话（topics）而不是摘要——摘要是元描述，塞进去会让开场白变得机械。
 */
export function buildGreeting(baseGreeting: string, memory?: CompanionMemory | null): string {
  // 去掉结尾标点，否则会拼出「打个招呼。，上次…」这种怪句子
  const base = (baseGreeting || '').trim().replace(/[。.,，；;\s]+$/, '');
  if (!memory) return base;
  const topic = memory.topics[0]?.text;
  const rel = memory.relation;

  const parts: string[] = [];
  if (base) parts.push(base);
  if (topic) {
    parts.push(`上次聊到「${topic.slice(0, 24).replace(/[「」]/g, '')}」，可以自然地接着这个话题`);
  } else if (memory.digests.length) {
    parts.push('自然地接续上次没聊完的话题');
  }
  if (rel.nickname) parts.push(`开口时叫 TA「${rel.nickname}」`);

  const out = parts.join('，');
  return out.length > 200 ? out.slice(0, 200) : out;
}
