'use client';

import { useEffect, useState } from 'react';
import { COMPANION_PRESETS, type CompanionPreset } from '@/data/companionPersonas';
import { VIDU_VOICES } from '@/data/voices';
import type { AvatarConfig } from '@/lib/vidu/types';
import {
  deleteCompanion,
  getStorageHealth,
  isAvatarUsable,
  listCompanions,
  newId,
  requestPersistentStorage,
  saveCompanion,
  type CompanionRecord,
  type StorageHealth,
} from '@/lib/companion/history';
import { readPresetAvatar } from '@/lib/companion/presetAvatar';

export interface StartPayload {
  avatar: AvatarConfig;
  displayName: string;
  displayImage: string;
  /**
   * 自定义搭子的本地记录 id。首次通话成功后，服务端回传的形象资产 id 会写回这条记录，
   * 之后该搭子即可零图片传输直接开聊。
   */
  companionId?: string;
  /** 精选搭子的 id，用于回写形象资产缓存（预设形象走 URL，也能做到秒开） */
  presetId?: string;
}

export default function RoleSelect({ onStart }: { onStart: (p: StartPayload) => void }) {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset');

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[calc(env(safe-area-inset-top)+28px)]">
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
          <p className="text-[11px] uppercase tracking-[0.42em] text-cyan-300/80">AI Companion · Realtime</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white neon-text">
          情感聊天搭子
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          选择一位懂你的数字人搭子，或上传照片生成专属 TA，进入 720P 实时智能对话。
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm backdrop-blur">
        <button
          onClick={() => setTab('preset')}
          className={`rounded-full py-2 transition ${tab === 'preset' ? 'bg-gradient-to-r from-cyan-500/90 to-indigo-500/90 text-white shadow-[0_0_18px_rgba(34,211,238,0.35)]' : 'text-slate-400'}`}
        >
          精选搭子
        </button>
        <button
          onClick={() => setTab('custom')}
          className={`rounded-full py-2 transition ${tab === 'custom' ? 'bg-gradient-to-r from-cyan-500/90 to-indigo-500/90 text-white shadow-[0_0_18px_rgba(34,211,238,0.35)]' : 'text-slate-400'}`}
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
  const [saveWarn, setSaveWarn] = useState('');
  const [health, setHealth] = useState<StorageHealth | null>(null);

  const refresh = async () => {
    const list = await listCompanions();
    setHistory(list);
    setHealth(getStorageHealth());
    setLoaded(true);
  };

  useEffect(() => {
    void requestPersistentStorage();
    void refresh();
  }, []);

  const startRecord = (rec: CompanionRecord) => {
    // 从影子备份恢复的记录可能只剩元数据，此时 thumb 是唯一能展示/重传的图
    const image = rec.image || rec.thumb || '';
    const avatar: AvatarConfig = {
      persona: rec.persona,
      voice: rec.voice,
      greeting_instruction: rec.greeting,
    };
    if (isAvatarUsable(rec)) {
      // 已缓存形象资产 → 只发 id，本次通话零图片传输
      avatar.id = rec.avatarId;
    } else if (image) {
      // 资产不存在/已临近失效 → 用库里的复用图兜底重传
      avatar.image_uri = image;
    } else {
      // 既无资产 id 也无图：这条记录已经不可用了，明确告知而不是发给服务端报错
      setSaveWarn('这条记录的图片已丢失，无法开始通话，请删除后重新上传。');
      return;
    }
    setSaveWarn('');
    onStart({
      avatar,
      displayName: rec.name,
      displayImage: image,
      companionId: rec.id,
    });
  };

  const handleCreate = async (
    rec: Omit<CompanionRecord, 'id' | 'createdAt'> & { uploadImage: string },
  ) => {
    const { uploadImage, ...rest } = rec;
    const full: CompanionRecord = { ...rest, id: newId(), createdAt: Date.now() };
    try {
      await saveCompanion(full);
      await refresh();
      setSaveWarn('');
    } catch (e) {
      // 存不进去必须让用户看见，否则会误以为已经保存、下次回来一片空白
      const reason = e instanceof Error ? e.message : String(e);
      setSaveWarn(
        `搭子没能保存到本地（${reason}）。浏览器可能处于隐私模式或存储空间已满，换个浏览器/退出隐私模式再试。本次通话不受影响。`,
      );
    }
    // 首次通话必须传高清图，Vidu 据此生成形象资产；成功后 id 会回写这条记录
    onStart({
      avatar: {
        persona: rec.persona,
        image_uri: uploadImage || rec.image,
        voice: rec.voice,
        greeting_instruction: rec.greeting,
      },
      displayName: rec.name,
      displayImage: rec.image,
      companionId: full.id,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteCompanion(id).catch(() => {});
    await refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      {saveWarn && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-200">
          {saveWarn}
        </div>
      )}
      {health && !health.indexedDbOk && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-200">
          本地数据库不可用，正在使用轻量备份{health.lastError ? `（${health.lastError}）` : ''}。
          请退出隐私模式或换用普通浏览器窗口，否则搭子记录无法长期保存。
        </div>
      )}
      {health?.source === 'localStorage-backup' && health.indexedDbOk && history.length > 0 && (
        <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-xs leading-relaxed text-cyan-200">
          检测到本地数据库被浏览器清空，已从轻量备份恢复 {history.length} 个搭子。图片可能不完整，建议重新上传一次以恢复最佳画质。
        </div>
      )}
      {loaded && history.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">我的搭子（{history.length}）</h2>
            <span className="text-[11px] text-slate-500">点击直接开始，无需重新上传</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="glass-dark flex items-center gap-3 rounded-3xl p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rec.image || rec.thumb || ''}
                  alt={rec.name}
                  className="h-14 w-14 flex-none rounded-2xl object-cover ring-1 ring-white/15"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-semibold text-white">{rec.name}</h3>
                    {isAvatarUsable(rec) && (
                      <span className="flex-none rounded-full border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] text-cyan-300">
                        形象已缓存
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-400">{rec.persona}</p>
                </div>
                <button
                  onClick={() => startRecord(rec)}
                  className="flex-none rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-[0_0_16px_rgba(34,211,238,0.35)] active:scale-95"
                >
                  开始
                </button>
                <button
                  onClick={() => handleDelete(rec.id)}
                  aria-label="删除"
                  className="flex-none rounded-full px-2 py-2 text-slate-500 active:scale-95"
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
      onClick={() => {
        const cached = readPresetAvatar(preset.id);
        onStart({
          avatar: {
            persona: preset.persona,
            // 命中缓存则只发 id，避免每次都让 Vidu 重新处理同一张图
            ...(cached ? { id: cached } : { image_uri: preset.image }),
            voice: preset.voice,
            greeting_instruction: preset.greeting,
          },
          displayName: preset.name,
          displayImage: preset.image,
          presetId: preset.id,
        });
      }}
      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-400/40 via-indigo-400/30 to-fuchsia-400/30 p-[1px] text-left transition active:scale-[0.99]"
    >
      <div className="glass-dark flex items-center gap-4 rounded-3xl p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preset.image}
          alt={preset.name}
          className="h-16 w-16 flex-none rounded-2xl object-cover ring-1 ring-cyan-300/30"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{preset.name}</h3>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-300">{preset.tagline}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{preset.description}</p>
        </div>
        <span className="ml-auto self-center text-cyan-300/60 transition group-active:translate-x-0.5">›</span>
      </div>
    </button>
  );
}

// ---- 形象图清晰度策略 ----
// 权衡后的档位：数字人输出上限是 720p(1280×720)，形象图长边 2048 已远超其采样需求，
// 再高（如 3840）只会线性放大上传体积与失败率，却换不来可见的画面提升。
// Vidu 限制：图片 ≤50MB、base64 解码后 <20MB。
const AVATAR_MAX_EDGE = 2048;
/** 上传 data URI（base64 串长）上限，保守留在 Vidu 解码 <20MB 限制内 */
const AVATAR_MAX_BYTES = 8 * 1024 * 1024;
/** 原图尺寸与体积都在阈值内 → 直接透传，零重编码损失 */
const AVATAR_PASSTHROUGH_BYTES = 2 * 1024 * 1024;
const AVATAR_QUALITY_LADDER = [0.95, 0.9, 0.82, 0.72];

/** 存库的复用图长边：够 UI 展示，也够形象资产失效时兜底重传 */
const REUSE_MAX_EDGE = 1024;
const REUSE_QUALITY = 0.85;
/** localStorage 影子备份用的缩略图：单条约 10~25KB，几十个搭子也塞得进 5MB 配额 */
const THUMB_MAX_EDGE = 320;
const THUMB_QUALITY = 0.75;
/** iOS Safari 单 canvas 像素上限约 16.7M，超出会直接白屏 */
const MAX_CANVAS_PIXELS = 16_000_000;

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

/** 把 data URI 长度换算成近似字节数（base64 每 4 字符约 3 字节） */
function dataUriBytes(uri: string): number {
  return Math.round(uri.length * 0.75);
}

/**
 * 一次选图产出三份：
 * - upload：长边 2048 的高清图，只在首次创建会话时传给 Vidu
 * - reuse ：长边 1024 的复用图，入 IndexedDB，用于 UI 展示与形象资产失效时的兜底重传
 * - thumb ：长边 320 的缩略图，入 localStorage 影子备份，IndexedDB 被清理时保住记录
 * IndexedDB 里不会堆积十几 MB 的原图。
 */
async function fileToAvatar(file: File): Promise<{
  upload: string;
  reuse: string;
  thumb: string;
  width: number;
  height: number;
}> {
  const src = await decodeImage(file);
  const longestEdge = Math.max(src.width, src.height);

  // 原图尺寸与本身体积都在阈值内 → 直接透传，零重编码损失
  const upload =
    longestEdge <= AVATAR_MAX_EDGE && file.size <= AVATAR_PASSTHROUGH_BYTES
      ? await readAsDataUri(file)
      : await renderToDataUri(src, AVATAR_MAX_EDGE, AVATAR_QUALITY_LADDER, AVATAR_MAX_BYTES, file);

  const reuse = await renderToDataUri(src, REUSE_MAX_EDGE, [REUSE_QUALITY], Infinity, file);
  const thumb = await renderToDataUri(src, THUMB_MAX_EDGE, [THUMB_QUALITY], Infinity, file);
  return { upload, reuse, thumb, width: src.width, height: src.height };
}

async function renderToDataUri(
  src: ImageBitmapSource,
  maxEdge: number,
  ladder: number[],
  maxBytes: number,
  fallbackFile: File,
): Promise<string> {
  const longestEdge = Math.max(src.width, src.height);
  const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
  let w = Math.max(1, Math.round(src.width * scale));
  let h = Math.max(1, Math.round(src.height * scale));

  // iOS Safari 单 canvas 像素上限保护，超出会直接白屏
  const pixels = w * h;
  if (pixels > MAX_CANVAS_PIXELS) {
    const s = Math.sqrt(MAX_CANVAS_PIXELS / pixels);
    w = Math.max(1, Math.round(w * s));
    h = Math.max(1, Math.round(h * s));
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return readAsDataUri(fallbackFile);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  src.draw(ctx, w, h);

  // 先用最高质量，超限再逐级降质，保证在体积约束内尽可能清晰
  let out = '';
  for (const q of ladder) {
    out = canvas.toDataURL('image/jpeg', q);
    if (out.length <= maxBytes) break;
  }
  return out;
}

function CustomForm({
  onCreate,
}: {
  onCreate: (rec: {
    name: string;
    persona: string;
    voice: string;
    greeting: string;
    /** 入库保存的复用图（长边 1024） */
    image: string;
    /** 影子备份用的缩略图（长边 320） */
    thumb: string;
    /** 本次创建会话用的高清图（长边 2048），不入库存 */
    uploadImage: string;
    width?: number;
    height?: number;
  }) => void;
}) {
  const [name, setName] = useState('我的搭子');
  const [persona, setPersona] = useState('你是一个温暖、真诚、善解人意的情感陪伴者，会耐心倾听并给予共情与支持。');
  const [greeting, setGreeting] = useState('用温柔亲切的语气打个招呼。');
  const [voice, setVoice] = useState('Tina');
  const [image, setImage] = useState('');
  const [thumb, setThumb] = useState('');
  const [uploadImage, setUploadImage] = useState('');
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
      const { upload, reuse, thumb, width, height } = await fileToAvatar(file);
      setUploadImage(upload);
      setImage(reuse);
      setThumb(thumb);
      setDims({ w: width, h: height });
      setImageMeta(
        `${width}×${height} · 上传 ${(dataUriBytes(upload) / 1024 / 1024).toFixed(1)}MB`,
      );
      setErr('');
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const canStart = persona.trim().length > 0 && uploadImage.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <label className="hud-corners flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-cyan-400/25 bg-white/5 p-5 text-center backdrop-blur">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="预览" className="h-36 w-36 rounded-2xl object-cover ring-1 ring-cyan-300/30" />
        ) : (
          <span className="text-sm text-slate-400">点击上传一张单人照片作为搭子形象</span>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <span className="text-xs text-cyan-300">
          {image ? `重新选择${imageMeta ? ` · ${imageMeta}` : ''}` : '支持 JPG/PNG/WEBP/HEIC，单人图'}
        </span>
        {image && (
          <span className="text-[11px] text-slate-500">
            高清上传（长边上限 2048px）· 仅首次上传，之后自动复用形象资产
          </span>
        )}
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

      {err && <p className="text-xs text-rose-400">{err}</p>}

      <button
        disabled={!canStart}
        onClick={() =>
          onCreate({
            name: name || '我的搭子',
            persona,
            voice,
            greeting,
            image,
            thumb,
            uploadImage,
            width: dims?.w,
            height: dims?.h,
          })
        }
        className="mt-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-[0_0_22px_rgba(34,211,238,0.35)] transition active:scale-[0.99] disabled:opacity-40 disabled:shadow-none"
      >
        保存并开始通话
      </button>
      <p className="text-center text-[11px] text-slate-500">创建后会自动存入「我的搭子」，下次直接开始</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-300">{label}</span>
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
        !custom && value === id
          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-[0_0_14px_rgba(34,211,238,0.4)]'
          : 'border border-white/10 bg-white/5 text-slate-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <p className="mb-1.5 text-[11px] text-fuchsia-300">女声</p>
        <div className="flex flex-wrap gap-2">
          {female.map((v) => (
            <Chip key={v.id} id={v.id} label={v.label.split(' · ')[1] || v.label} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[11px] text-cyan-300">男声</p>
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
