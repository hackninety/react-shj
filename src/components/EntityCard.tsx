import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import { getEntity } from 'shj-ts-lib/entities';
import { getLocation } from 'shj-ts-lib/locations';
import { getImagesByEntity, getCollections, imageUrl } from 'shj-ts-lib/images';
import type { Entity, ImageMeta } from 'shj-ts-lib';
import {
  CATEGORY_COLORS, CATEGORY_LABELS, CHAPTER_TITLES, CONFIDENCE_LABELS, IMAGE_BASE,
} from '../lib/data';

interface Props {
  entityId: string;
  onClose: () => void;
}

/** 点击图标弹出的百科卡片：古图 + 原文 + 白话 + 地望考据 */
export default function EntityCard({ entityId, onClose }: Props) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    setEntity(null);
    setImgIdx(0);
    getEntity(entityId).then((e) => {
      if (!alive || !e) return;
      setEntity(e);
      setImages(getImagesByEntity(e.id));
    });
    return () => {
      alive = false;
    };
  }, [entityId]);

  if (!entity) {
    return (
      <aside className="card-in pointer-events-auto flex h-full w-105 items-center justify-center bg-(--paper) shadow-2xl">
        <span className="animate-pulse text-sm opacity-60">翻检经卷…</span>
      </aside>
    );
  }

  const loc = entity.locationId ? getLocation(entity.locationId) : undefined;
  const collections = getCollections();
  const img = images[imgIdx];
  const color = CATEGORY_COLORS[entity.category];

  return (
    <aside className="card-in pointer-events-auto flex h-full w-105 flex-col overflow-hidden bg-(--paper) shadow-2xl">
      {/* 头部 */}
      <header className="flex items-start gap-3 border-b border-(--ink)/10 px-5 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-classic text-3xl leading-none font-bold">{entity.name}</h2>
            <span className="text-sm opacity-55">{entity.pinyin}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className="rounded-full px-2 py-0.5 font-medium text-white"
              style={{ background: color }}
            >
              {CATEGORY_LABELS[entity.category]}
            </span>
            {entity.aliases.map((a) => (
              <span key={a} className="rounded-full bg-(--ink)/8 px-2 py-0.5">
                又名 {a}
              </span>
            ))}
            {entity.tags.map((t) => (
              <span key={t} className="rounded-full border border-(--ink)/15 px-2 py-0.5 opacity-75">
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="关闭"
          className="rounded-full p-1.5 opacity-55 transition hover:bg-(--ink)/10 hover:opacity-100"
        >
          <X size={18} />
        </button>
      </header>

      {/* 正文滚动区 */}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {/* 古图 */}
        {img && (
          <figure className="mb-4">
            <div className="flex items-center justify-center rounded-lg border border-(--ink)/10 bg-white/60 p-2">
              <img
                key={img.id}
                src={imageUrl(img, IMAGE_BASE)}
                alt={`${entity.name}（${collections[img.collection]?.titleSimp ?? img.collection}）`}
                className="max-h-72 w-auto max-w-full object-contain"
              />
            </div>
            <figcaption className="mt-1.5 flex items-center justify-between gap-2 text-xs opacity-65">
              <span className="truncate">
                {collections[img.collection]?.titleSimp} · {collections[img.collection]?.era}
              </span>
              <a
                href={img.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-0.5 underline-offset-2 hover:underline"
              >
                {img.license} <ExternalLink size={11} />
              </a>
            </figcaption>
            {images.length > 1 && (
              <div className="mt-2 flex gap-2">
                {images.map((im, i) => (
                  <button
                    key={im.id}
                    onClick={() => setImgIdx(i)}
                    className={`h-14 w-14 overflow-hidden rounded border-2 bg-white/60 p-0.5 transition ${
                      i === imgIdx ? 'border-(--seal)' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    title={collections[im.collection]?.titleSimp}
                  >
                    <img
                      src={imageUrl(im, IMAGE_BASE)}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </figure>
        )}

        {/* 白话简介 */}
        <p className="mb-4 text-[15px] leading-relaxed">{entity.brief}</p>

        {/* 原文出处 */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold tracking-widest opacity-50">经文出处</h3>
          <div className="space-y-3">
            {entity.occurrences.map((occ) => (
              <blockquote
                key={`${occ.chapter}-${occ.entry}`}
                className="rounded-md border-l-3 bg-(--paper-2) px-3.5 py-2.5"
                style={{ borderLeftColor: color }}
              >
                <p className="font-classic text-[15px] leading-relaxed" lang="zh-Hant">
                  {occ.quoteTrad}
                </p>
                <footer className="mt-1.5 text-xs opacity-55">
                  ——《{CHAPTER_TITLES[occ.chapter] ?? occ.chapter}》{occ.primary ? '' : '（又见）'}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* 流变按语 */}
        {entity.lore && (
          <p className="mb-4 rounded-md bg-(--ink)/5 px-3 py-2 text-[13px] leading-relaxed opacity-80">
            按：{entity.lore}
          </p>
        )}

        {/* 地望 */}
        {loc && (
          <section className="rounded-lg border border-(--ink)/12 bg-white/50 px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin size={15} className="shrink-0" style={{ color }} />
              所居：{loc.nameSimp}
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${
                  loc.confidence === 'identified'
                    ? 'bg-emerald-700/15 text-emerald-900'
                    : loc.confidence === 'disputed'
                      ? 'bg-amber-600/15 text-amber-900'
                      : 'bg-slate-500/15 text-slate-700'
                }`}
              >
                {CONFIDENCE_LABELS[loc.confidence]}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed opacity-80">{loc.modern}</p>
            <p className="mt-1 text-xs leading-relaxed opacity-55">依据：{loc.basis}</p>
          </section>
        )}
      </div>
    </aside>
  );
}
