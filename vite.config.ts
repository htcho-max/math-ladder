import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

// mode 'demo' = 아티팩트용 한 파일 빌드 (dist-demo/index.html)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins:
    mode === 'demo'
      ? [react(), viteSingleFile()]
      : [
          react(),
          VitePWA({
            registerType: 'autoUpdate',
            workbox: {
              globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
              skipWaiting: true,
              clientsClaim: true,
              maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
              // 글꼴: 한 번 받으면 오프라인에서도 쓰도록 캐시
              runtimeCaching: [
                { urlPattern: /^https:\/\/fonts\.googleapis\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-css' } },
                { urlPattern: /^https:\/\/fonts\.gstatic\.com\//, handler: 'CacheFirst', options: { cacheName: 'google-fonts', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } } },
              ],
            },
            manifest: {
              name: '수학 사다리',
              short_name: '수학 사다리',
              description: '초등 덧셈부터 고등 미적분까지, 이어지는 개념으로 배우는 수학',
              lang: 'ko',
              theme_color: '#2563eb',
              background_color: '#f8fafc',
              display: 'standalone',
              icons: [
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
          }),
        ],
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0') },
  build: mode === 'demo' ? { outDir: 'dist-demo', assetsInlineLimit: 100_000_000 } : {},
  server: { host: true },
  preview: { host: true },
  test: { environment: 'node' },
}));
