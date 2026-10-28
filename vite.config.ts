import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 古图静态资源：node_modules/shj-ts-lib/assets/images → /shj-images
    // （dev 下插件直接虚拟服务，build 时拷入 dist）
    viteStaticCopy({
      targets: [{ src: 'node_modules/shj-ts-lib/assets/images/*', dest: 'shj-images' }],
    }),
  ],
  optimizeDeps: {
    // shj-ts-lib 的预构建 dist 使用 JSON import attributes，交给 esbuild
    // 预打包内联供浏览器消费；本地 file: 联调时也明确预打包这些入口
    include: [
      'shj-ts-lib',
      'shj-ts-lib/text',
      'shj-ts-lib/entities',
      'shj-ts-lib/locations',
      'shj-ts-lib/images',
      'shj-ts-lib/geo',
    ],
  },
});
