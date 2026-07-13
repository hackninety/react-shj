import { useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { findEntities } from 'shj-ts-lib';
import type { EntityIndexItem } from 'shj-ts-lib';
import {
  ALL_CATEGORIES, ALL_CONFIDENCE, CATEGORY_COLORS, CATEGORY_LABELS, CONFIDENCE_LABELS,
  type EntityCategory, type EntityFeature, type LocationConfidence,
} from '../lib/data';

interface Props {
  features: EntityFeature[];
  categories: Set<EntityCategory>;
  confidence: Set<LocationConfidence>;
  onToggleCategory: (c: EntityCategory) => void;
  onToggleConfidence: (c: LocationConfidence) => void;
  onSelect: (id: string) => void;
}

/** 顶部工具条：搜索（繁简折叠）+ 类别开关 + 置信度开关 */
export default function FilterBar({
  features, categories, confidence, onToggleCategory, onToggleConfidence, onSelect,
}: Props) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number>(undefined);

  const results: EntityIndexItem[] = useMemo(
    () => (q.trim() ? findEntities(q.trim(), { limit: 8 }) : []),
    [q],
  );

  const counts = useMemo(() => {
    const m = new Map<EntityCategory, number>();
    for (const f of features) {
      m.set(f.properties.category, (m.get(f.properties.category) ?? 0) + 1);
    }
    return m;
  }, [features]);

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      {/* 搜索 */}
      <div className="relative">
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 py-1.5 pr-3 pl-3 shadow-md ring-1 ring-(--ink)/10">
          <Search size={15} className="opacity-45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              blurTimer.current = window.setTimeout(() => setFocused(false), 150);
            }}
            placeholder="搜异兽 / 神祇 / 方国…"
            className="w-44 bg-transparent text-sm outline-none placeholder:opacity-45"
          />
        </div>
        {focused && results.length > 0 && (
          <ul className="absolute top-full left-0 z-1000 mt-1.5 w-72 overflow-hidden rounded-xl bg-white/98 shadow-xl ring-1 ring-(--ink)/10">
            {results.map((e) => (
              <li key={e.id}>
                <button
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-(--paper-2)"
                  onMouseDown={() => {
                    window.clearTimeout(blurTimer.current);
                    onSelect(e.id);
                    setQ('');
                    setFocused(false);
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: CATEGORY_COLORS[e.category] }}
                  />
                  <span className="font-classic shrink-0 text-[15px] font-semibold">{e.name}</span>
                  <span className="truncate text-xs opacity-55">{e.brief}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 类别开关 */}
      <div className="flex flex-wrap items-center gap-1 rounded-full bg-white/95 px-2 py-1.5 shadow-md ring-1 ring-(--ink)/10">
        {ALL_CATEGORIES.map((c) => {
          const on = categories.has(c);
          return (
            <button
              key={c}
              onClick={() => onToggleCategory(c)}
              className={`rounded-full px-2 py-0.5 text-xs transition ${on ? 'text-white' : 'opacity-40 hover:opacity-70'}`}
              style={{ background: on ? CATEGORY_COLORS[c] : 'transparent', color: on ? '#fff' : undefined }}
              title={`${CATEGORY_LABELS[c]}（${counts.get(c) ?? 0}）`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </div>

      {/* 置信度开关 */}
      <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1.5 shadow-md ring-1 ring-(--ink)/10">
        {ALL_CONFIDENCE.map((c) => {
          const on = confidence.has(c);
          return (
            <button
              key={c}
              onClick={() => onToggleConfidence(c)}
              className={`rounded-full px-2 py-0.5 text-xs transition ${
                on ? 'bg-(--ink)/80 text-(--paper)' : 'opacity-40 hover:opacity-70'
              }`}
            >
              {CONFIDENCE_LABELS[c]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
