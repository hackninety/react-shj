import { useEffect, useMemo, useState } from 'react';
import MapView from './components/MapView';
import EntityCard from './components/EntityCard';
import FilterBar from './components/FilterBar';
import {
  ALL_CATEGORIES, ALL_CONFIDENCE, ALL_FEATURES, DISCLAIMER, STATS,
  type EntityCategory, type LocationConfidence,
} from './lib/data';

export default function App() {
  const [categories, setCategories] = useState<Set<EntityCategory>>(new Set(ALL_CATEGORIES));
  const [confidence, setConfidence] = useState<Set<LocationConfidence>>(new Set(ALL_CONFIDENCE));
  // 支持 ?e=<实体id> 直达分享（如 /?e=qiongqi）
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const id = new URLSearchParams(window.location.search).get('e');
    return id && ALL_FEATURES.some((f) => f.properties.entityId === id) ? id : null;
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId) url.searchParams.set('e', selectedId);
    else url.searchParams.delete('e');
    window.history.replaceState(null, '', url);
  }, [selectedId]);

  const features = useMemo(
    () =>
      ALL_FEATURES.filter(
        (f) => categories.has(f.properties.category) && confidence.has(f.properties.confidence),
      ),
    [categories, confidence],
  );

  const toggle = <T,>(set: Set<T>, v: T): Set<T> => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    // 全关无意义：至少保留当前项
    return next.size === 0 ? set : next;
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 地图 */}
      <MapView features={features} selectedId={selectedId} onSelect={setSelectedId} />

      {/* 顶部悬浮层：标题 + 工具条 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-500 flex flex-col gap-2.5 p-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="pointer-events-auto flex items-baseline gap-3 rounded-2xl bg-(--ink)/88 px-4.5 py-2 text-(--paper) shadow-lg">
            <h1 className="font-classic text-xl font-bold tracking-wide">山海经 · 世界舆图</h1>
            <span className="text-xs opacity-70">
              {STATS.chapters} 卷 · {STATS.entities} 实体 · {STATS.images} 幅古图
            </span>
          </div>
          <FilterBar
            features={features}
            categories={categories}
            confidence={confidence}
            onToggleCategory={(c) => setCategories((s) => toggle(s, c))}
            onToggleConfidence={(c) => setConfidence((s) => toggle(s, c))}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* 右侧卡片 */}
      {selectedId && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-600 py-3.5 pr-3.5">
          <div className="h-full overflow-hidden rounded-2xl">
            <EntityCard entityId={selectedId} onClose={() => setSelectedId(null)} />
          </div>
        </div>
      )}

      {/* 底部免责 */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-500 max-w-xl p-2">
        <p
          className="pointer-events-auto cursor-help truncate rounded bg-white/70 px-2 py-0.5 text-[10px] opacity-60 hover:opacity-90"
          title={DISCLAIMER}
        >
          坐标仅为可视化示意（identified 可考 / disputed 取一说 / legendary 神话示意位）· 悬停查看完整声明
        </p>
      </div>
    </div>
  );
}
