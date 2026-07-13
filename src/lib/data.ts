/** 数据胶水层：一次性取库数据、类别配色、卷名映射 */
import { getChapters, getCorpusStats, CATEGORY_LABELS, CONFIDENCE_LABELS, DISCLAIMER } from 'shj-ts-lib';
import type { EntityCategory, EntityFeatureProps, GeoFeature, LocationConfidence } from 'shj-ts-lib';
import { entitiesToGeoJSON } from 'shj-ts-lib/geo';

export { CATEGORY_LABELS, CONFIDENCE_LABELS, DISCLAIMER };
export type { EntityCategory, EntityFeatureProps, LocationConfidence };

export type EntityFeature = GeoFeature<EntityFeatureProps>;

/** 全量实体要素（应用生命周期内不变，筛选在客户端做） */
export const ALL_FEATURES: EntityFeature[] = entitiesToGeoJSON().features;

export const STATS = getCorpusStats();

/** 卷 slug → 简体卷名 */
export const CHAPTER_TITLES: Record<string, string> = Object.fromEntries(
  getChapters().map((c) => [c.id, c.titleSimp]),
);

/** 类别配色（marker/图例/卡片徽章共用） */
export const CATEGORY_COLORS: Record<EntityCategory, string> = {
  beast: '#c2554f',
  bird: '#d98e32',
  fish: '#3f8fbf',
  snake: '#6f9d55',
  dragon: '#7b5cc6',
  deity: '#c9a227',
  human: '#a06e58',
  nation: '#5f7d95',
  plant: '#4d9e83',
  mineral: '#8a8f98',
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS) as EntityCategory[];
export const ALL_CONFIDENCE: LocationConfidence[] = ['identified', 'disputed', 'legendary'];

/** 古图静态资源前缀（vite-plugin-static-copy 输出目录） */
export const IMAGE_BASE = '/shj-images';
