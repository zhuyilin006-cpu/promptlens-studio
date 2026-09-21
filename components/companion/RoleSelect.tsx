'use client';

import { useEffect, useState } from 'react';
import { COMPANION_PRESETS, type CompanionPreset } from '@/data/companionPersonas';
import { VIDU_VOICES } from '@/data/voices';
import type { AvatarConfig } from '@/lib/vidu/types';
import {
  deleteCompanion,
  listCompanions,
  newId,
  saveCompanion,
  type CompanionRecord,
} from '@/lib/companion/history';

export interface StartPayload {
  avatar: AvatarConfig;
  displayName: string;
  displayImage: string;
}

export default function RoleSelect({ onStart }: { onStart: (p: StartPayload) => void }) {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset');

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[calc(env(safe-area-inset-top)+28px)]">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.32em] text-rose-400/80">Emotional Companion</p>
        <h1 className="mt-2 font-serif text-3xl text-slate-800">情感聊天搭子</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          选择一位懂你的数字人搭子，或上传照片创建专属的 TA，随时开启一段温暖的实时对话。
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1 text-sm">
        <button
          onClick={() => setTab('preset')}
          className={`rounded-full py-2 transition ${tab === 'preset' ? 'bg-white text-slate-800 shadow' : 'text-slate-500'}`}
        >
          精选搭子
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`rounded-full py-2 transition ${tab === 'custom' ? 'bg-white text-slate-800 shadow' : 'text-slate-500'}`}
        >
          创建专属
        </button>
      </div>

      {tab === 'preset' ? (
        <PresetList onStart={onStart} />
      ) : (
        <CustomTab onStart={onStart} />
      )}
    </div>
  );
}

function CustomTab({ onStart }: { onStart: (p: StartPayload) => void }) {
  const [history, setHistory] = useState<CompanionRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    setHistory(await listCompanions());
    setLoaded(true);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const startRecord = (rec: CompanionRecord) => {
    onStart({
      avatar: {
        persona: rec.persona,
        image_uri: rec.image,
        voice: rec.voice,
        greeting_instruction: rec.greeting,
      },
      displayName: rec.name,
      displayImage: rec.image,
    });
  };

  const handleCreate = async (rec: Omit<CompanionRecord, 'id' | 'createdAt'>) => {
    const full: CompanionRecord = { ...rec, id: newId(), createdAt: Date.now() };
    try {
      await saveCompanion(full);
      await refresh();
    } catch {
      /* 存储失败不阻断通话 */
    }
    startRecord(full);
  };

  const handleDelete = async (id: string) => {
    await deleteCompanion(id).catch(() => {});
    await refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      {loaded && history.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">我的搭子（{history.length}）</h2>
            <span className="text-[11px] text-slate-400">点击直接开始，无需重新上传</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center gap-3 rounded-3xl bg-white/80 p-3 shadow-sm backdrop-blur"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rec.image} alt={rec.name} className="h-14 w-14 flex-none rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-800">{rec.name}</h3>
                  <p className="truncate text-xs text-slate-500">{rec.persona}</p>
                </div>
                <button
                  onClick={() => startRecord(rec)}
                  className="flex-none rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-white active:scale-95"
                >
                  开始
                </button>
                <button
                  onClick={() => handleDelete(rec.id)}
                  aria-label="删除"
                  className="flex-none rounded-full px-2 py-2 text-slate-400 active:scale-95"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <CustomForm onCreate={handleCreate} />
    </div>
  );
}

function PresetList({ onStart }: { onStart: (p: StartPayload) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {COMPANION_PRESETS.map((p) => (
        <PresetCard key={p.id} preset={p} onStart={onStart} />
      ))}
    </div>
  );
}

function PresetCard({ preset, onStart }: { preset: CompanionPreset; onStart: (p: StartPayload) => void }) {
  return (
    <button
      onClick={() =>
        onStart({
          avatar: {
            persona: preset.persona,
            image_uri: preset.image,
            voice: preset.voice,
            greeting_instruction: preset.greeting,
          },
          displayName: preset.name,
          displayImage: preset.image,
        })
      }
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${preset.accent} p-[1px] text-left shadow-sm transition active:scale-[0.99]`}
    >
      <div className="flex items-center gap-4 rounded-3xl bg-white/80 p-4 backdrop-blur">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preset.image}
          alt={preset.name}
          className="h-16 w-16 flex-none rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">{preset.name}</h3>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] text-rose-500">{preset.tagline}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{preset.description}</p>
        </div>
      </div>
    </button>
  );
}

// ---- 形象图清晰度策略 ----
// 目标：尽量保留原图高分辨率（长边 3840 + JPEG 0.95），只有在体积过大时才逐级降质，
// 避免"上传后变糊"。Vidu image_uri 支持 ≤50MB、解码后 <20MB（base64 串长 < ~26MB）。
const AVATAR_MAX_EDGE = 3840;
/** data URI（base64 串长）目标上限，保守留在 Vidu 解码 <20MB 限制内 */
const AVATAR_MAX_BYTES = 18 * 1024 * 1024;
/** 原图本身就在阈值内时直接透传，零重编码损失 */
const AVATAR_PASSTHROUGH_BYTES = 10 * 1024 * 1024;
const AVATAR_QUALITY_LADDER = [0.98, 0.95, 0.9, 0.82, 0.72];

interface ImageBitmapSource {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

function readAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/**
 * 解码图片。优先 createImageBitmap(imageOrientation: 'from-image')：
 * 可按 EXIF 摆正手机竖拍照片，且缩放采样质量优于 img+canvas 直绘。
 */
async function decodeImage(file: File): Promise<ImageBitmapSource> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return {
        width: bmp.width,
        height: bmp.height,
        draw: (ctx, w, h) => ctx.drawImage(bmp, 0, 0, w, h),
      };
    } catch {
      /* 浏览器不支持该选项时回退到 <img> */
    }
  }
  const uri = await readAsDataUri(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('图片解析失败'));
    img.src = uri;
  });
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
  };
}

async function fileToAvatar(file: File): Promise<{ uri: string; width: number; height: number }> {
  const src = await decodeImage(file);
  const longestEdge = Math.max(src.width, src.height);

  // 原图尺寸与本身体积都在阈值内 → 直接透传，不做任何重采样/重编码
  if (longestEdge <= AVATAR_MAX_EDGE && file.size <= AVATAR_PASSTHROUGH_BYTES) {
    return { uri: await readAsDataUri(file), width: src.width, height: src.height };
  }

  // 仅在超过长边上限时缩放，否则保持原始分辨率
  const scale = longestEdge > AVATAR_MAX_EDGE ? AVATAR_MAX_EDGE / longestEdge : 1;
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { uri: await readAsDataUri(file), width: src.width, height: src.height };
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  src.draw(ctx, w, h);

  // 先用最高质量，超限再逐级降质，保证在体积约束内尽可能清晰
  let out = '';
  for (const q of AVATAR_QUALITY_LADDER) {
    out = canvas.toDataURL('image/jpeg', q);
    if (out.length <= AVATAR_MAX_BYTES) break;
  }
  return { uri: out, width: w, height: h };
}

function CustomForm({
  onCreate,
}: {
  onCreate: (rec: {
    name: string;
    persona: string;
    voice: string;
    greeting: string;
    image: string;
    width?: number;
    height?: number;
  }) => void;
}) {
  const [name, setName] = useState('我的搭子');
  const [persona, setPersona] = useState('你是一个温暖、真诚、善解人意的情感陪伴者，会耐心倾听并给予共情与支持。');
  const [greeting, setGreeting] = useState('用温柔亲切的语气打个招呼。');
  const [voice, setVoice] = useState('Tina');
  const [image, setImage] = useState('');
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [imageMeta, setImageMeta] = useState('');
  const [err, setErr] = useState('');

  const onPick = async (file?: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setErr('图片需小于 50MB');
      return;
    }
    try {
      const { uri, width, height } = await fileToAvatar(file);
      setImage(uri);
      setDims({ w: width, h: height });
      setImageMeta(`${width}×${height} · ${(uri.length * 0.75 / 1024 / 1024).toFixed(1)}MB`);
      setErr('');
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const canStart = persona.trim().length > 0 && image.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 p-5 text-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="预览" className="h-36 w-36 rounded-2xl object-cover" />
        ) : (
          <span className="text-sm text-slate-400">点击上传一张单人照片作为搭子形象</span>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <span className="text-xs text-rose-400">
          {image ? `重新选择${imageMeta ? ` · ${imageMeta}` : ''}` : '支持 PNG/JPG/WEBP，单人图'}
        </span>
        {image && <span className="text-[11px] text-slate-400">已按原图清晰度保留（长边上限 3840px）</span>}
      </label>

      <Field label="搭子名字">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </Field>
      <Field label="人设 persona">
        <textarea value={persona} onChange={(e) => setPersona(e.target.value)} rows={4} className="input resize-none" />
      </Field>
      <Field label="开场白提示词（≤200字）">
        <input value={greeting} maxLength={200} onChange={(e) => setGreeting(e.target.value)} className="input" />
      </Field>
      <Field label="音色（男声 / 女声可选）">
        <VoicePicker value={voice} onChange={setVoice} />
      </Field>

      {err && <p className="text-xs text-rose-500">{err}</p>}

      <button
        disabled={!canStart}
        onClick={() =>
          onCreate({
            name: name || '我的搭子',
            persona,
            voice,
            greeting,
            image,
            width: dims?.w,
            height: dims?.h,
          })
        }
        className="mt-1 rounded-full bg-slate-800 py-3 text-sm font-medium text-white transition active:scale-[0.99] disabled:opacity-40"
      >
        保存并开始通话
      </button>
      <p className="text-center text-[11px] text-slate-400">创建后会自动存入「我的搭子」，下次直接开始</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function VoicePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isPreset = VIDU_VOICES.some((v) => v.id === value);
  const [custom, setCustom] = useState(!isPreset);
  const female = VIDU_VOICES.filter((v) => v.gender === 'female');
  const male = VIDU_VOICES.filter((v) => v.gender === 'male');

  const Chip = ({ id, label }: { id: string; label: string }) => (
    <button
      type="button"
      onClick={() => {
        setCustom(false);
        onChange(id);
      }}
      className={`rounded-full px-3 py-1.5 text-xs transition active:scale-95 ${
        !custom && value === id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <p className="mb-1.5 text-[11px] text-rose-400">女声</p>
        <div className="flex flex-wrap gap-2">
          {female.map((v) => (
            <Chip key={v.id} id={v.id} label={v.label.split(' · ')[1] || v.label} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] text-sky-500">男声</p>
        <div className="flex flex-wrap gap-2">
          {male.map((v) => (
            <Chip key={v.id} id={v.id} label={v.label.split(' · ')[1] || v.label} />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setCustom((c) => !c)}
        className="self-start text-[11px] text-slate-400 underline underline-offset-2"
      >
        {custom ? '收起自定义' : '使用自定义/克隆音色 ID'}
      </button>
      {custom && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="填写音色 ID（如克隆音色名）"
          className="input"
        />
      )}
    </div>
  );
}
