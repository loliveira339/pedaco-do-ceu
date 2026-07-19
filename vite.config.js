import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: o service worker novo assume assim que a página recarrega,
      // sem exigir o usuário confirmar — essencial aqui porque o site muda
      // com frequência (cardápio, preços, pedidos) e não pode travar numa
      // versão velha do app.
      registerType: 'autoUpdate',
      includeAssets: ['images/logotipo.jpeg'],
      manifest: {
        name: 'Pedaço do Céu — Tortas & Pudins Artesanais',
        short_name: 'Pedaço do Céu',
        description: 'Tortas salgadas artesanais e pudins cremosos, feitos com carinho. Encomende pelo app.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FBF3E7',
        theme_color: '#5B3A22',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Nunca deixar o service worker interceptar chamadas de API —
        // pedidos, frete e checkout PagBank sempre precisam ir direto pro
        // servidor, nunca servir uma resposta cacheada.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
          {
            // Cardápio/galeria vêm do Supabase — cache curto só como
            // fallback offline, sempre tentando rede primeiro para não
            // mostrar produtos/preços desatualizados.
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /\/images\/.*\.(?:jpg|jpeg|png|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagens-produtos',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    // Em dev, roda `vercel dev` numa porta separada só para servir as
    // funções serverless (/api/*) e proxeia pra cá — evita o bug de tela
    // em branco quando o `vercel dev` tenta servir o Vite ele mesmo.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
