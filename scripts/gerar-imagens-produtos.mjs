#!/usr/bin/env node
/**
 * Gera fotos de produto para o cardápio do Pedaço do Céu usando a API do
 * Gemini (Nano Banana / gemini-2.5-flash-image), no estilo visual da marca
 * (tons creme, marrom, dourado — fotografia de comida profissional, luz
 * natural, sem texto/logo na imagem).
 *
 * Como rodar:
 *   node scripts/gerar-imagens-produtos.mjs
 *
 * Requer Node 18+ (usa fetch nativo). Precisa da variável GEMINI_API_KEY
 * definida em um destes lugares (nessa ordem de prioridade):
 *   1. Variável de ambiente do processo (export GEMINI_API_KEY=...)
 *   2. .env na raiz deste projeto (pedaco-do-ceu/.env)
 *   3. .env do projeto irmão vendedor-alfa-backend (fallback de conveniência,
 *      já que a chave já está cadastrada lá)
 *
 * Salva cada imagem em public/images/<arquivo> — os nomes dos arquivos já
 * batem com o que está referenciado em src/data/seedFallback.js e em
 * supabase/schema.sql, então nenhum outro arquivo precisa ser tocado.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'images');

const ENV_FALLBACKS = [
  path.join(PROJECT_ROOT, '.env'),
  path.resolve(PROJECT_ROOT, '..', 'Projeto Vendedor Alfa 2.0', 'vendedor-alfa-backend', '.env'),
];

const STYLE_SUFFIX =
  'professional food photography, natural soft window light, warm cream ' +
  'and gold color palette, light wood or white ceramic surface, shallow ' +
  'depth of field, appetizing, high detail, rustic-elegant bakery styling, ' +
  'no text, no logos, no watermark, square 1:1 composition';

const PRODUTOS = [
  {
    arquivo: 'torta-frango-catupiry.jpg',
    prompt:
      `Overhead shot of a golden baked Brazilian savory pie (torta salgada) with a flaky crust, ` +
      `one slice cut and pulled slightly out revealing a creamy shredded chicken and catupiry ` +
      `cheese filling, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'torta-caipira.jpg',
    prompt:
      `Golden baked Brazilian savory pie (torta salgada caipira) filled with shredded chicken, ` +
      `corn kernels and crispy bacon, one slice cut showing the filling, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'torta-palmito.jpg',
    prompt:
      `Golden baked Brazilian savory pie (torta salgada) filled with creamy palm heart (palmito) ` +
      `and olives, one slice cut and displayed, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'pudim-chocolate.jpg',
    prompt:
      `Glossy dark chocolate Brazilian pudim (flan) unmolded on a white plate, rich chocolate ` +
      `caramel sauce dripping down the sides, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'pudim-leite-ninho.jpg',
    prompt:
      `Creamy pale golden Brazilian pudim (flan) made with milk-powder (leite ninho), unmolded ` +
      `on a white plate with caramel sauce pooling around it, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'pudim-perfeito.jpg',
    prompt:
      `Creamy pale golden Brazilian pudim (flan) unmolded on a white plate, glossy caramel sauce ` +
      `pooling around it, smooth silky texture that looks like it melts in your mouth, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'torta-pentecostal.jpg',
    prompt:
      `Golden baked Brazilian savory pie (torta salgada) generously filled with shredded chicken, ` +
      `catupiry cheese, corn, peas and olives, one slice cut and displayed showing the rich ` +
      `colorful filling, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'torta-cachorro-quente.jpg',
    prompt:
      `Golden baked Brazilian savory pie (torta salgada) filled with sliced sausage, melted cheese ` +
      `and a light special sauce, one slice cut and displayed showing the filling, ${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'mini-pudim-tradicional.jpg',
    prompt:
      `A single small individual Brazilian mini pudim (flan) in a small bundt-ring shape, unmolded ` +
      `on a white plate, glossy caramel sauce dripping down the sides and pooling around it, ` +
      `${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'mini-pudim-coco.jpg',
    prompt:
      `A single small individual Brazilian mini pudim (flan) in a small bundt-ring shape, unmolded ` +
      `on a white plate, topped generously with shredded coconut, caramel sauce pooling around it, ` +
      `${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'mini-pudim-chocolate.jpg',
    prompt:
      `A single small individual Brazilian mini pudim (flan) in a small bundt-ring shape, unmolded ` +
      `on a white plate, drizzled generously with glossy chocolate sauce dripping down the sides, ` +
      `${STYLE_SUFFIX}`,
  },
  {
    arquivo: 'mini-pudim-laranja.jpg',
    prompt:
      `A single small individual Brazilian mini pudim (flan) in a small bundt-ring shape, unmolded ` +
      `on a white plate, caramel sauce pooling around it, garnished with a fresh orange slice on ` +
      `top, ${STYLE_SUFFIX}`,
  },
  {
    // Banner principal do Hero (topo do site) — substitui o antigo
    // banner-instagram.jpeg, que era um print de post do Instagram com
    // texto/telefone embutidos na imagem (ruim: informação desatualizável
    // e duplicada com o texto do próprio site). Este é landscape (não
    // quadrado) para caber no card do Hero, e sem nenhum texto/logo — o
    // nome, subtítulo e CTA já existem em HTML por cima da imagem.
    arquivo: 'banner-hero.jpg',
    aspectRatio: '4:3',
    largura: 1200,
    altura: 900,
    prompt:
      'Eye-level styled food photography flat-lay for a Brazilian home bakery hero banner: a ' +
      'golden baked savory pie (torta salgada) with one slice cut and pulled out revealing a ' +
      'creamy shredded chicken filling, next to a glossy unmolded Brazilian pudim (flan) with ' +
      'caramel sauce dripping down, both arranged on a light wood table with a linen cloth, ' +
      'soft natural window light from the side, warm cream and gold tones, a few loose caramel ' +
      'drips and a sprig of mint as garnish, shallow depth of field, appetizing, high detail, ' +
      'rustic-elegant bakery styling, no text, no logos, no watermark, no hands, landscape 4:3 composition',
  },
];

function lerApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

  for (const envPath of ENV_FALLBACKS) {
    if (!fs.existsSync(envPath)) continue;
    const conteudo = fs.readFileSync(envPath, 'utf-8');
    const linha = conteudo.split('\n').find((l) => l.trim().startsWith('GEMINI_API_KEY='));
    if (linha) {
      const valor = linha.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      if (valor) return valor;
    }
  }
  return null;
}

async function gerarImagem(apiKey, prompt, aspectRatio = '1:1') {
  const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gemini-2.5-flash-image',
      input: [{ type: 'text', text: prompt }],
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: aspectRatio,
        image_size: '1K',
      },
    }),
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${bodyText.slice(0, 500)}`);
  }

  let json;
  try {
    json = JSON.parse(bodyText);
  } catch {
    throw new Error(`Resposta não é JSON válido: ${bodyText.slice(0, 300)}`);
  }

  // A forma exata do campo pode variar (output_image.data é o documentado,
  // mas a Interactions API é recente — se a Google mudar o formato, ajuste
  // aqui). Tentamos alguns caminhos comuns antes de desistir.
  // Formato real observado: json.steps[].content[] com itens { mime_type, data }.
  const imagemNosSteps = (json?.steps || [])
    .flatMap((step) => step?.content || [])
    .find((item) => item?.data && String(item?.mime_type || '').startsWith('image/'));

  const base64 =
    json?.output_image?.data ||
    json?.outputImage?.data ||
    json?.output?.[0]?.image?.data ||
    imagemNosSteps?.data ||
    null;

  if (!base64) {
    throw new Error(
      `Não encontrei os dados da imagem na resposta. JSON recebido (primeiros 800 chars): ` +
        JSON.stringify(json).slice(0, 800)
    );
  }

  return Buffer.from(base64, 'base64');
}

const TAMANHO_ALVO_KB = 300;
const LARGURA_WEB_PX = 1000;

// A API devolve PNG grande (~1.5-2MB) mesmo pedindo jpeg — convertemos para
// JPEG real, redimensionamos para uso web e reduzimos qualidade até caber
// numa faixa de tamanho razoável para carregar rápido no site.
async function comprimirParaJpeg(bufferOriginal, largura = LARGURA_WEB_PX, altura = LARGURA_WEB_PX) {
  const redimensionado = sharp(bufferOriginal).resize(largura, altura, { fit: 'cover' });

  for (const qualidade of [80, 70, 60, 50, 40]) {
    const buffer = await redimensionado.clone().jpeg({ quality: qualidade, mozjpeg: true }).toBuffer();
    if (buffer.length / 1024 <= TAMANHO_ALVO_KB) return buffer;
  }
  return redimensionado.clone().jpeg({ quality: 40, mozjpeg: true }).toBuffer();
}

async function main() {
  const apiKey = lerApiKey();
  if (!apiKey) {
    console.error(
      'GEMINI_API_KEY não encontrada. Defina a variável de ambiente, crie um .env neste ' +
        'projeto com GEMINI_API_KEY=..., ou confirme que o .env do vendedor-alfa-backend existe.'
    );
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const forcar = process.argv.includes('--force');

  for (const produto of PRODUTOS) {
    const destino = path.join(OUTPUT_DIR, produto.arquivo);

    if (!forcar && fs.existsSync(destino)) {
      console.log(`${produto.arquivo}: já existe, pulando (use --force para regenerar).`);
      continue;
    }

    process.stdout.write(`Gerando ${produto.arquivo}... `);
    try {
      const bufferBruto = await gerarImagem(apiKey, produto.prompt, produto.aspectRatio || '1:1');
      const buffer = await comprimirParaJpeg(bufferBruto, produto.largura, produto.altura);
      fs.writeFileSync(destino, buffer);
      console.log(`ok (${(buffer.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.log('FALHOU');
      console.error(`  -> ${err.message}`);
    }
  }

  console.log('\nConcluído. Confira as imagens em public/images/.');
}

main();
