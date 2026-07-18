# Pedaço do Céu — Tortas & Pudins

Site institucional + painel administrativo (React + Vite + Tailwind + Supabase).

O site funciona imediatamente com conteúdo de exemplo (`src/data/seedFallback.js`), mesmo sem
backend configurado. Para ativar o cardápio dinâmico, o painel da Milena e a Calculadora de
Precificação de verdade, siga os passos abaixo para configurar o Supabase.

## 1. Instalar dependências

```bash
npm install
```

## 2. Criar o projeto no Supabase

1. Crie uma conta/projeto em [supabase.com](https://supabase.com).
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo
   `supabase/schema.sql` deste projeto e execute (**Run**). Isso cria as tabelas, as políticas de
   segurança (RLS), o bucket de imagens `fotos` e alguns produtos de exemplo.
3. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public key`

## 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_WHATSAPP_NUMBER=5511976858856
```

## 4. Criar o login da administradora (Milena)

No painel do Supabase: **Authentication → Users → Add user**. Cadastre o e-mail e senha que a
Milena vai usar para entrar em `/admin`. Não é necessário nenhum código adicional — qualquer
usuário criado ali já consegue logar no painel (o sistema é single-tenant: um único
administrador cuida de todo o conteúdo).

## 5. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5173` para o site público e `http://localhost:5173/admin` para o painel.

## 6. Build de produção

```bash
npm run build
npm run preview
```

Publique a pasta `dist/` em qualquer hospedagem de site estático (Vercel, Netlify, Hostinger etc.).
Lembre-se de configurar as mesmas variáveis de ambiente (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_WHATSAPP_NUMBER`) na plataforma de deploy.

## Estrutura do projeto

```
src/
  components/       componentes reutilizáveis (Navbar, Footer, WhatsApp, Reveal…)
    admin/          componentes do painel (Modal, Field, AdminLayout, ProtectedRoute)
    sections/       seções da home (Hero, Cardápio, Galeria, FAQ…)
  context/          AuthContext (sessão do Supabase Auth)
  data/             seedFallback.js — conteúdo de exemplo sem backend
  hooks/            useCrud — hook genérico de CRUD usado pelo painel
  lib/              supabaseClient.js — cliente + helpers de WhatsApp
  pages/            HomePage + páginas do painel admin
  utils/            precificacao.js — fórmulas da Calculadora Inteligente
supabase/
  schema.sql        tabelas, RLS, bucket de storage e seed de produtos
```

## Calculadora Inteligente de Precificação

Fórmula usada (markup sobre o preço de venda, não sobre o custo — garante que a margem desejada
seja exatamente a margem real):

```
custo_ingredientes   = Σ(quantidade × custo_unitário)
custo_desperdício    = custo_ingredientes × (%desperdício / 100)
custo_indiretos      = embalagem + gás + energia + mão de obra + entrega + outros
custo_total          = custo_ingredientes + custo_desperdício + custo_indiretos
custo_por_unidade    = custo_total / rendimento_unidades
preço_mínimo         = custo_por_unidade
preço_ideal          = custo_por_unidade / (1 − margem_desejada / 100)
lucro_por_unidade    = preço_ideal − custo_por_unidade
margem_real (%)      = (lucro_por_unidade / preço_ideal) × 100
```

Todo cálculo salvo fica no histórico (tabela `calculos_precificacao`) para consulta futura.

## Preparado para expansão futura

A arquitetura (Supabase + RLS + hook de CRUD genérico) já comporta, sem retrabalho estrutural:
pedidos online, controle de estoque, cupons de desconto e integração mais profunda com WhatsApp
(API oficial). Basta criar as novas tabelas seguindo o mesmo padrão de `supabase/schema.sql`.
