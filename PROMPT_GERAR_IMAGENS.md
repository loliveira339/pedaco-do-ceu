# Prompt para o Claude Code — gerar fotos de produto com Gemini

Copie o texto abaixo e cole no Claude Code, rodando dentro da pasta
`C:\Projetos\pedaco-do-ceu`.

---

Preciso que você rode o script `scripts/gerar-imagens-produtos.mjs` deste
projeto para gerar fotos de produto usando a API do Gemini
(gemini-2.5-flash-image, endpoint `/v1beta/interactions`) e salvá-las em
`public/images/`.

**Atualização 2**: o script agora tem 4 entradas novas para uma linha de
Mini Pudins (Tradicional, Coco, Chocolate e Laranja — formato individual,
que está em alta), além das 8 fotos anteriores (5 sabores novos + as 3
fotos que substituíram as fotos de Instagram nos produtos originais). O
script pula automaticamente qualquer arquivo que já exista em
`public/images/` — só gera o que estiver faltando. Use
`node scripts/gerar-imagens-produtos.mjs --force` só se quiser regenerar
tudo do zero.

Contexto:
- A `GEMINI_API_KEY` já existe em `C:\Projetos\Projeto Vendedor Alfa 2.0\vendedor-alfa-backend\.env`.
  O script já tenta ler de lá automaticamente como fallback. Se não achar,
  copie o valor dessa chave para um `.env` na raiz deste projeto
  (`GEMINI_API_KEY=...`).
- Os arquivos de destino já são referenciados em `src/data/seedFallback.js`
  e em `supabase/schema.sql` — não renomeie os arquivos de saída. Os 4
  que faltam gerar agora são: `mini-pudim-tradicional.jpg`,
  `mini-pudim-coco.jpg`, `mini-pudim-chocolate.jpg`,
  `mini-pudim-laranja.jpg`.
- Os 4 Mini Pudins são inspirados numa referência visual real (formato
  individual tipo mini bundt, desenformado, com calda de caramelo —
  tradicional puro, coco ralado por cima, chocolate escorrendo, e uma
  rodela de laranja fresca). Os prompts no script já descrevem isso; se
  o resultado sair muito diferente (por exemplo sem o formato de mini
  bundt), ajuste o prompt correspondente no array `PRODUTOS`.
- Os produtos, preços (R$ 12–13, formato individual) e descrições desses
  4 Mini Pudins, e as 4 entradas correspondentes na Galeria, já estão
  cadastrados em `seedFallback.js` e num bloco novo idempotente no final
  de `supabase/schema.sql` — não precisa mexer nisso, só gerar as fotos.

O que fazer:
1. Rode `node scripts/gerar-imagens-produtos.mjs`. Ele vai pular as fotos
   que já existem e gerar só as 4 novas dos Mini Pudins.
2. Se der erro de autenticação, confirme a variável `GEMINI_API_KEY`
   (leia o `.env` do vendedor-alfa-backend se precisar).
3. Se o script falhar reportando "Não encontrei os dados da imagem na
   resposta" (a API Interactions do Gemini ainda é recente e pode mudar o
   formato), imprima o JSON completo de uma resposta de teste, identifique
   onde vem a imagem em base64, e ajuste a função `gerarImagem()` —
   o restante da lógica pode permanecer igual. Da última vez o campo real
   veio em `json.steps[].content[]` (itens com `mime_type` + `data`), o
   script já trata esse caso, mas confirme se continua batendo.
4. Depois que as 4 novas imagens forem salvas em `public/images/`, abra
   cada uma e confirme visualmente que:
   - Não tem nenhum texto, logo ou marca d'água estranha na imagem.
   - O prato parece mesmo um mini pudim individual (formato pequeno, tipo
     mini bundt), com a cobertura certa para cada sabor (coco ralado,
     chocolate escorrendo, rodela de laranja).
   - O tamanho de cada arquivo está numa faixa razoável para web
     (idealmente entre ~80 KB e ~400 KB — o script já comprime com
     `sharp`, mas confirme).
5. Rode `npm run dev` e confira visualmente a seção "Cardápio" da home:
   os 12 produtos (incluindo os 4 Mini Pudins) devem aparecer com fotos
   consistentes no mesmo estilo, nenhuma esticada ou cortada de forma
   estranha.
6. Me dê um resumo curto do que funcionou, o que precisou de ajuste no
   script, e se sobrou algum problema que eu preciso resolver manualmente.

Não precisa alterar mais nada no restante do projeto — produtos, preços,
descrições e os inserts na galeria já estão todos cadastrados em
`seedFallback.js` e `supabase/schema.sql`, só falta gerar essas 4 fotos.
