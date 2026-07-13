# react-shj —— 山海经 · 世界舆图

把 [shj-ts-lib](https://github.com/hackninety/shj-ts-lib)（《山海经》语料库：18 卷经文 / 226 实体 / 188 地望坐标 / 269 条水系 / 251 幅历代古图）渲染成可交互世界地图：

- **打点**：`entitiesToGeoJSON()` 一次拿到全部实体 Point，按类别配色（异兽/奇鸟/鳞介/蛇虺/龙属/神祇/奇人/方国/神木），神话示意位（legendary）虚线弱化
- **卡片**：点击图标 → 右侧卡片：历代古图（多版本可切换，带年代与许可出处）+ 经文原文（繁体原句读）+ 白话简介 + 地望考据与置信度
- **检索**：繁简折叠搜索（「窮奇」「穷奇」「饕餮」都能命中），选中即飞达
- **筛选**：类别开关 × 地望置信度开关（identified 可考 / disputed 取一说 / legendary 示意位）
- **水系图层**：开关显示 `riversToGeoJSON()` 的 73 条流向示意线——「漳水 · 出发鸠之山 · 东流注于河」，方向取自经文，长度非实际河道

## 运行

```bash
npm install   # shj-ts-lib 经 file:../shj-ts-lib 链接（与 D:\WWW 同级布局）
npm run dev
```

> 独立部署时可把依赖换成 `"shj-ts-lib": "github:hackninety/shj-ts-lib"`（安装时自动构建）。
> 古图静态资源由 vite-plugin-static-copy 从包内 `assets/images` 输出到 `/shj-images`。

## 换「上古舆图」底图（预留）

底图配置集中在 `src/components/MapView.tsx` 的 `BASEMAP` 常量，三条路线：

1. **手绘整图**：`L.imageOverlay(古地图.jpg, bounds)` 叠在（或替换）瓦片层，配 `map.setMaxBounds`
2. **古地图瓦片**：用 [Map Warper](https://mapwarper.net/) / QGIS 把古舆图配准切片，替换 `tileLayer` 的 url
3. **意象地图**（不对应真实经纬）：改用 `L.CRS.Simple` 自建坐标系——此时需为实体另做一套「画布坐标」，建议在 shj-ts-lib 的 locations 上加 `canvasX/canvasY` 字段而不动 lat/lng

数据侧无需改动：GeoJSON 的过滤（类别/置信度）与卡片逻辑与底图无关。

## 技术栈

Vite 7 · React 19 · TypeScript · Tailwind CSS 4 · Leaflet 1.9（原生 API，未用 react-leaflet）
