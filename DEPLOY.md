# Publicando o Pedaço do Céu

Recomendação: **Vercel** (hospedagem do site) + **Registro.br** (domínio
`.com.br`). Não precisa de servidor próprio — este projeto é um site
estático (Vite + React) com backend no Supabase, exatamente o tipo de
projeto para o qual Vercel foi feito: deploy em minutos, HTTPS automático,
CDN global, e o plano gratuito (Hobby) já é suficiente para o tráfego de
um site institucional local (100 GB de banda/mês, 1M requisições/mês, até
50 domínios customizados por projeto).

Um servidor próprio (VPS) só valeria a pena se um dia o projeto crescer
para algo com backend próprio rodando processos contínuos — não é o caso
aqui.

## Custos

- **Domínio `.com.br`** no Registro.br: R$ 40/ano (preço oficial, sem
  pegadinha de renovação cara — outras registradoras costumam cobrar
  R$ 5-15 no primeiro ano e depois R$ 70-90/ano na renovação).
- **Vercel Hobby**: gratuito, sem cartão de crédito.
- **Supabase**: o plano gratuito atual também é suficiente para começar.

Total recorrente: ~R$ 40/ano.

## Passo a passo

### 1. Colocar o projeto num repositório Git

O jeito mais simples de manter o Vercel atualizado automaticamente é
conectar a um repositório no GitHub (toda vez que você ou o Claude Code
mudar algo e der `git push`, o site atualiza sozinho).

```bash
cd "C:\Projetos\pedaco-do-ceu"
git init
git add .
git commit -m "Site Pedaço do Céu"
```

Crie um repositório vazio no GitHub (github.com → New repository) e
depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/pedaco-do-ceu.git
git branch -M main
git push -u origin main
```

### 2. Configurar o projeto que você já criou na Vercel

Você já tem um projeto criado em vercel.com/lucas-oliveiras-projects-330d58b9.
O que fazer depende de como esse projeto foi criado — veja qual caminho é
o seu:

**Caminho A — o projeto ainda não está conectado a nenhum repositório**
(foi criado vazio, ou você nunca chegou a importar o código):

1. Suba o projeto pro GitHub seguindo o passo 1 acima, se ainda não fez.
2. Dentro do projeto na Vercel, procure a opção de conectar um
   repositório Git (em geral aparece direto na tela inicial do projeto
   quando ele está vazio: "Connect Git Repository" ou similar). Selecione
   o repositório `pedaco-do-ceu`.
3. Se a Vercel não oferecer essa opção dentro do projeto existente, o
   mais simples é: apague esse projeto vazio (Settings → General → role
   até o fim → Delete Project) e crie de novo com "Add New" → "Project"
   → importe direto do GitHub. É mais rápido do que tentar conectar um
   projeto solto depois.

**Caminho B — o projeto já está conectado a um repositório** (você já
tinha importado o código antes):

Pule direto para a configuração abaixo.

**Configuração (vale para os dois caminhos), dentro do projeto → Settings:**

1. **Settings → General → Build & Development Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: deixe o padrão (`npm install`)
2. **Settings → Environment Variables** — adicione, marcando
   Production + Preview + Development:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMBER`

   (mesmos valores que estão no seu `.env` local). Isso é essencial — o
   `.env` local não vai pro Git de propósito (está no `.gitignore`), sem
   essas variáveis configuradas aqui o site em produção cai no modo "sem
   Supabase configurado".
3. Vá em **Deployments** e clique em "Redeploy" no último deploy (ou
   simplesmente dê um `git push` de qualquer mudancinha) para o deploy
   sair já com as variáveis de ambiente aplicadas — variáveis novas só
   valem a partir do próximo deploy, não no deploy que já rodou.
4. Em ~1 minuto você tem uma URL do tipo `pedaco-do-ceu.vercel.app` no
   ar, com HTTPS.

O arquivo `vercel.json` já está no projeto — ele garante que rotas como
`/admin`, `/admin/produtos` etc. funcionem certinho ao dar F5 direto nelas
(sem isso, um site de página única hospedado de forma estática pode
devolver 404 nessas URLs).

### 3. Testar tudo na URL `.vercel.app` antes de apontar o domínio

Confira, na URL temporária da Vercel:
- Home carrega, cardápio aparece, WhatsApp abre certo.
- `/admin` — login funciona (crie o primeiro usuário da Milena no
  Supabase, se ainda não fez — veja o `README.md`).
- Painel admin — CRUD de produtos, calculadora, tudo funcionando.

### 4. Domínio já registrado ✓

Você já registrou `pedacodoceudelicias.com.br` no registro.br — não
precisa repetir esse passo. (Já ajustei o `index.html` — canonical e
Open Graph — para usar esse domínio real.)

### 5. Apontar o domínio pra Vercel

1. No painel do projeto na Vercel: **Settings → Domains** → adicione
   `pedacodoceudelicias.com.br` e também `www.pedacodoceudelicias.com.br`.
2. A Vercel vai mostrar exatamente quais registros DNS configurar —
   normalmente um registro `A` (apontando pro IP `76.76.21.21`) para o
   domínio raiz, e um `CNAME` (apontando para `cname.vercel-dns.com`)
   para o `www`. **Use os valores que a própria tela da Vercel mostrar**,
   eles podem ter sido atualizados desde que escrevi isso.
3. No painel do registro.br (registro.br → "Meus domínios" →
   `pedacodoceudelicias.com.br` → editar zona DNS), cadastre esses
   mesmos registros.
4. Aguarde a propagação do DNS (de alguns minutos a poucas horas). A
   Vercel emite o certificado HTTPS automaticamente assim que detectar o
   domínio apontado corretamente — a página de Domains mostra um ✓
   quando estiver tudo certo.

### 6. Atualizar as URLs permitidas no Supabase

No painel do Supabase: Authentication → URL Configuration.
- **Site URL**: `https://www.pedacodoceudelicias.com.br`
- **Redirect URLs**: adicione também
  `https://www.pedacodoceudelicias.com.br/**`,
  `https://pedacodoceudelicias.com.br/**` e, enquanto for útil pra
  testes, `https://pedaco-do-ceu.vercel.app/**`.

Sem isso, o login da Milena pode falhar ou redirecionar para o lugar
errado em produção.

## Depois de publicado

- Qualquer alteração que eu (ou o Claude Code) fizer no projeto local:
  basta `git add . && git commit -m "..." && git push` que a Vercel
  redeploya sozinha em menos de um minuto.
- Se quiser, dá pra configurar um ambiente de "preview" automático: toda
  vez que você criar uma branch/PR no GitHub, a Vercel gera uma URL de
  teste separada antes de ir pro ar de verdade — útil se um dia quiser
  testar mudanças grandes sem afetar o site no ar.

Sources:
- [Vercel Pricing: Hobby, Pro, and Enterprise plans](https://vercel.com/pricing)
- [Vercel Docs — Limits](https://vercel.com/docs/limits)
- [Registro.br — Pagamento de domínio](https://registro.br/ajuda/pagamento-de-dominio/)
