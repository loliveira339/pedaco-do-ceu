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

---

**Atualização 3**: adicionei mais uma entrada no script, desta vez para o
**banner principal do Hero** (o card grande que aparece na abertura do
site, ao lado do título "Um pedaço do céu em cada mordida").

Contexto:
- O banner atual é `public/images/banner-instagram.jpeg` — um print de um
  post do Instagram, com o texto "@pedacodoceudelicias", telefone e outros
  textos já embutidos na própria imagem. Isso é ruim: duplica informação
  que já está em HTML no site, e qualquer atualização de telefone/preço
  exigiria gerar uma imagem nova. Vamos substituir por uma foto de comida
  limpa, sem nenhum texto, no mesmo estilo visual das fotos de produto já
  geradas.
- Adicionei a entrada `banner-hero.jpg` no array `PRODUTOS` do script
  `scripts/gerar-imagens-produtos.mjs`. Diferente das fotos de produto
  (que são quadradas 1:1), essa é **paisagem (4:3, 1200x900)** porque
  precisa preencher um card retangular largo no Hero — por isso adicionei
  suporte a `aspectRatio`/`largura`/`altura` por item no script (as fotos
  de produto continuam default 1:1 1000x1000, sem precisar mudar nada
  nelas).
- `src/components/sections/Hero.jsx` já foi atualizado para referenciar
  `/images/banner-hero.jpg` no lugar do banner antigo. O arquivo antigo
  `banner-instagram.jpeg` **não foi apagado** (ainda é usado como
  `og:image` em `index.html` para compartilhamento em redes sociais — pode
  deixar como está, ou trocar depois se quiser).

O que fazer:
1. Rode `node scripts/gerar-imagens-produtos.mjs`. Como só falta o
   `banner-hero.jpg` (as outras já existem), ele vai gerar só essa.
2. Abra `public/images/banner-hero.jpg` e confirme visualmente que:
   - Não tem texto, logo, marca d'água ou mãos na imagem.
   - Mostra claramente uma torta salgada (fatiada, mostrando o recheio) e
     um pudim (desenformado, com calda), como uma foto de mesa bonita —
     não uma montagem tipo post de rede social.
   - A composição é mais larga que alta (paisagem), não quadrada.
3. Rode `npm run dev` e confira a seção Hero (topo da home): o banner deve
   preencher o card arredondado à direita do título sem esticar nem
   cortar de forma estranha.
4. Se o resultado não ficar bom (por exemplo enquadramento ruim para o
   card retangular), ajuste o prompt da entrada `banner-hero.jpg` no
   script e rode de novo com
   `node scripts/gerar-imagens-produtos.mjs --force`.
5. Me dê um resumo curto do resultado.
