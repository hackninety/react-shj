import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CATEGORY_COLORS, type EntityFeature } from '../lib/data';

/**
 * 底图配置。后期换「上古舆图」风格：
 *  - 手绘整图：L.imageOverlay(url, bounds) + map.setMaxBounds
 *  - 自制瓦片：换 tileLayer url（如 mapwarper/maptiler 切好的古地图瓦片）
 *  - 纯意象地图（不对应真实经纬）：L.CRS.Simple 另建坐标系
 */
const BASEMAP = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

interface Props {
  features: EntityFeature[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function MapView({ features, selectedId, onSelect }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 初始化地图（StrictMode 双调用安全：cleanup 彻底销毁）
  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    const map = L.map(holder, {
      center: [35, 105],
      zoom: 4,
      minZoom: 2,
      maxZoom: 12,
      worldCopyJump: true,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    L.tileLayer(BASEMAP.url, { attribution: BASEMAP.attribution }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // 打点（筛选或选中变化时重建；183 点量级直接重建足够快）
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const f of features) {
      const [lng, lat] = f.geometry.coordinates;
      const p = f.properties;
      const selected = p.entityId === selectedId;
      const size = selected ? 18 : 13;
      const icon = L.divIcon({
        className: 'shj-marker-wrap',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `<div class="shj-marker${p.confidence === 'legendary' ? ' shj-marker--legendary' : ''}${
          selected ? ' shj-marker--selected' : ''
        }" style="--marker-color:${CATEGORY_COLORS[p.category]}"></div>`,
      });
      const m = L.marker([lat, lng], { icon, riseOnHover: true, zIndexOffset: selected ? 1000 : 0 });
      m.bindTooltip(p.name, { direction: 'top', offset: [0, -8], className: 'shj-tooltip' });
      m.on('click', () => onSelectRef.current(p.entityId));
      layer.addLayer(m);
    }
  }, [features, selectedId]);

  // 选中后飞过去（缩放不够时拉近）
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const f = features.find((x) => x.properties.entityId === selectedId);
    if (!f) return;
    const [lng, lat] = f.geometry.coordinates;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 6), { duration: 0.8 });
  }, [selectedId, features]);

  return <div ref={holderRef} className="h-full w-full" />;
}
