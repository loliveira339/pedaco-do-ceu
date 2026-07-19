import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
