#!/usr/bin/env node
// Gera os ícones do PWA a partir do logo, em todos os tamanhos exigidos
// por Android (manifest) e iOS (apple-touch-icon). Rodar sempre que o
// logo mudar: node scripts/gerar-icones-pwa.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOGO = path.join(PROJECT_ROOT, 'public', 'images', 'logotipo.jpeg');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'icons');

// Ícones "any" — logo ocupando o quadro inteiro, para navegadores/Android
// mais antigos e como fallback.
const ICONES_ANY = [192, 512];

// Ícone "maskable" — Android moderno recorta em formas variadas (círculo,
// squircle, etc), então o conteúdo precisa ficar dentro de uma "safe zone"
// central de ~80% da área, com respiro ao redor (aqui: fundo creme da marca
// + logo com padding generoso, evitando cortar o miolo do desenho).
const MASKABLE_SIZE = 512;
const MASKABLE_PADDING_PCT = 0.14; // ~14% de margem de cada lado

// apple-touch-icon: iOS não suporta transparência nem "maskable" — precisa
// ser um quadrado opaco, cantos são arredondados automaticamente pelo SO.
const APPLE_TOUCH_SIZE = 180;

const BRAND_CREAM = '#FBF3E7';

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const size of ICONES_ANY) {
    const dest = path.join(OUTPUT_DIR, `icon-${size}.png`);
    await sharp(LOGO).resize(size, size, { fit: 'cover' }).png().toFile(dest);
    console.log(`icon-${size}.png ok`);
  }

  const inner = Math.round(MASKABLE_SIZE * (1 - MASKABLE_PADDING_PCT * 2));
  const logoBuffer = await sharp(LOGO).resize(inner, inner, { fit: 'cover' }).png().toBuffer();
  await sharp({
    create: {
      width: MASKABLE_SIZE,
      height: MASKABLE_SIZE,
      channels: 4,
      background: BRAND_CREAM,
    },
  })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(OUTPUT_DIR, 'icon-maskable-512.png'));
  console.log('icon-maskable-512.png ok');

  await sharp(LOGO)
    .resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE, { fit: 'cover' })
    .flatten({ background: BRAND_CREAM })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
  console.log('apple-touch-icon.png ok');

  console.log('\nÍcones gerados em public/icons/.');
}

main();
