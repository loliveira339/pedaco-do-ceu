-- ============================================================
-- Pedaço do Céu — Schema Supabase
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Painel Supabase -> SQL Editor -> New query -> colar -> Run)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── CATEGORIAS ──────────────────────────────────────────────
create table if not exists categorias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text not null unique,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- ── INGREDIENTES (base reutilizável para a calculadora) ─────
create table if not exists ingredientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  unidade_medida text not null default 'g', -- g | kg | ml | l | unidade
  custo_unitario numeric(12,4) not null default 0, -- custo por 1 unidade da unidade_medida (ex: por grama)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── PRODUTOS (cardápio público) ──────────────────────────────
create table if not exists produtos (
  id uuid primary key default uuid_generate_v4(),
  categoria_id uuid references categorias(id) on delete set null,
  nome text not null,
  descricao text,
  preco numeric(12,2),
  imagem_url text,
  ativo boolean not null default true,
  destaque boolean not null default false,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── LIGAÇÃO PRODUTO <-> INGREDIENTES (ficha técnica opcional) ─
create table if not exists produto_ingredientes (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid not null references produtos(id) on delete cascade,
  ingrediente_id uuid not null references ingredientes(id) on delete cascade,
  quantidade numeric(12,4) not null default 0
);

-- ── GALERIA DE FOTOS ─────────────────────────────────────────
create table if not exists galeria (
  id uuid primary key default uuid_generate_v4(),
  imagem_url text not null,
  legenda text,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- ── DEPOIMENTOS ──────────────────────────────────────────────
create table if not exists depoimentos (
  id uuid primary key default uuid_generate_v4(),
  nome_cliente text not null,
  texto text not null,
  nota int not null default 5 check (nota between 1 and 5),
  aprovado boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── HISTÓRICO DA CALCULADORA DE PRECIFICAÇÃO ────────────────
create table if not exists calculos_precificacao (
  id uuid primary key default uuid_generate_v4(),
  produto_id uuid references produtos(id) on delete set null,
  produto_nome text not null,
  peso_final_g numeric(12,2) not null default 0,
  rendimento_unidades int not null default 1,
  percentual_desperdicio numeric(6,2) not null default 0,
  margem_desejada numeric(6,2) not null default 0,
  custo_embalagem numeric(12,2) not null default 0,
  custo_gas numeric(12,2) not null default 0,
  custo_energia numeric(12,2) not null default 0,
  custo_mao_obra numeric(12,2) not null default 0,
  custo_entrega numeric(12,2) not null default 0,
  custo_outros numeric(12,2) not null default 0,
  ingredientes_json jsonb not null default '[]',
  custo_ingredientes numeric(12,2) not null default 0,
  custo_total numeric(12,2) not null default 0,
  custo_por_kg numeric(12,2) not null default 0,
  custo_por_unidade numeric(12,2) not null default 0,
  preco_minimo numeric(12,2) not null default 0,
  preco_ideal numeric(12,2) not null default 0,
  lucro_por_unidade numeric(12,2) not null default 0,
  margem_real numeric(6,2) not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Regra geral: leitura pública só do que é vitrine (produtos ativos,
-- categorias, galeria, depoimentos aprovados). Tudo o mais (ingredientes,
-- custos, calculadora) e toda ESCRITA exigem usuário autenticado
-- (login da administradora). Este projeto é single-tenant: qualquer
-- usuário autenticado é a Milena/admin, não há multi-usuário público.
-- ============================================================

alter table categorias enable row level security;
alter table ingredientes enable row level security;
alter table produtos enable row level security;
alter table produto_ingredientes enable row level security;
alter table galeria enable row level security;
alter table depoimentos enable row level security;
alter table calculos_precificacao enable row level security;

-- Categorias: leitura pública, escrita autenticada
create policy "categorias_select_public" on categorias for select using (true);
create policy "categorias_write_auth" on categorias for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Produtos: leitura pública só de ativos, admin vê/edita tudo
create policy "produtos_select_public" on produtos for select using (ativo = true);
create policy "produtos_select_auth_all" on produtos for select using (auth.role() = 'authenticated');
create policy "produtos_write_auth" on produtos for insert with check (auth.role() = 'authenticated');
create policy "produtos_update_auth" on produtos for update using (auth.role() = 'authenticated');
create policy "produtos_delete_auth" on produtos for delete using (auth.role() = 'authenticated');

-- Ingredientes: só admin (não aparece no site público)
create policy "ingredientes_all_auth" on ingredientes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Produto x Ingredientes: só admin
create policy "produto_ingredientes_all_auth" on produto_ingredientes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Galeria: leitura pública, escrita admin
create policy "galeria_select_public" on galeria for select using (true);
create policy "galeria_write_auth" on galeria for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Depoimentos: leitura pública só dos aprovados, admin vê/edita tudo
create policy "depoimentos_select_public" on depoimentos for select using (aprovado = true);
create policy "depoimentos_select_auth_all" on depoimentos for select using (auth.role() = 'authenticated');
create policy "depoimentos_write_auth" on depoimentos for insert with check (auth.role() = 'authenticated');
create policy "depoimentos_update_auth" on depoimentos for update using (auth.role() = 'authenticated');
create policy "depoimentos_delete_auth" on depoimentos for delete using (auth.role() = 'authenticated');

-- Calculadora: só admin, nunca público
create policy "calculos_all_auth" on calculos_precificacao for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE — bucket de fotos (produtos, galeria, banner)
-- Rode também (o Supabase às vezes exige criar o bucket pela UI:
-- Storage -> New bucket -> nome "fotos" -> marque "Public bucket")
-- ============================================================
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos_select_public" on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos_insert_auth" on storage.objects for insert with check (bucket_id = 'fotos' and auth.role() = 'authenticated');
create policy "fotos_update_auth" on storage.objects for update using (bucket_id = 'fotos' and auth.role() = 'authenticated');
create policy "fotos_delete_auth" on storage.objects for delete using (bucket_id = 'fotos' and auth.role() = 'authenticated');

-- ============================================================
-- SEED — categorias e produtos reais extraídos do material da marca
-- ============================================================
insert into categorias (nome, slug, ordem) values
  ('Tortas', 'tortas', 1),
  ('Pudins', 'pudins', 2)
on conflict (slug) do nothing;

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Torta Pentecostal', 'Recheio cremoso e generoso de frango desfiado, catupiry, milho, ervilha, azeitona e temperos especiais. Massa amanteigada, dourada e crocante.', 45.00, '/images/post-instagram 1.jpeg', true, 1
from categorias where slug = 'tortas'
on conflict do nothing;

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Torta Cachorro Quente', 'Recheio cremoso de salsicha, queijo derretido, molho especial e temperos que fazem toda a diferença. Massa leve e douradinha, crocante por fora e macia por dentro.', 42.00, '/images/post-instagram 2.jpeg', false, 2
from categorias where slug = 'tortas'
on conflict do nothing;

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Pudim Perfeito', 'Textura ultra cremosa que desmancha na boca, com calda no ponto certo — doce na medida e irresistível.', 28.00, '/images/post-instagram 3.jpeg', true, 1
from categorias where slug = 'pudins'
on conflict do nothing;

-- Preços acima são estimativas iniciais — ajuste pelo painel admin
-- (ou recalcule com a Calculadora de Precificação) assim que tiver os
-- custos reais de ingredientes cadastrados.

-- ============================================================
-- SEED ADICIONAL — novos sabores (cardápio expandido)
-- Pode ser rodado separadamente a qualquer momento: os "not exists"
-- evitam duplicar produtos, mesmo que o schema.sql inteiro já tenha
-- sido executado antes.
-- ============================================================
insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Torta de Frango com Catupiry', 'Recheio cremoso de frango desfiado com catupiry derretido, temperado no ponto certo. Massa dourada e amanteigada.', 44.00, '/images/torta-frango-catupiry.jpg', false, 3
from categorias where slug = 'tortas'
and not exists (select 1 from produtos where nome = 'Torta de Frango com Catupiry');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Torta Caipira', 'Frango desfiado, milho verde, bacon crocante e ervas frescas — um clássico que remete ao interior. Massa crocante por fora, macia por dentro.', 46.00, '/images/torta-caipira.jpg', false, 4
from categorias where slug = 'tortas'
and not exists (select 1 from produtos where nome = 'Torta Caipira');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Torta de Palmito', 'Recheio cremoso de palmito com toque de azeitona e temperos especiais. Opção leve e saborosa para quem busca algo diferente.', 44.00, '/images/torta-palmito.jpg', false, 5
from categorias where slug = 'tortas'
and not exists (select 1 from produtos where nome = 'Torta de Palmito');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Pudim de Chocolate', 'Pudim cremoso de chocolate meio amargo, com calda irresistível. Para quem ama um doce mais intenso.', 30.00, '/images/pudim-chocolate.jpg', false, 2
from categorias where slug = 'pudins'
and not exists (select 1 from produtos where nome = 'Pudim de Chocolate');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Pudim Leite Ninho', 'Pudim aveludado de leite ninho, com aquele sabor de infância que todo mundo ama.', 30.00, '/images/pudim-leite-ninho.jpg', false, 3
from categorias where slug = 'pudins'
and not exists (select 1 from produtos where nome = 'Pudim Leite Ninho');

-- ============================================================
-- SEED ADICIONAL — fotos dos novos sabores na galeria
-- ============================================================
insert into galeria (imagem_url, legenda, ordem)
select '/images/torta-frango-catupiry.jpg', 'Torta de Frango com Catupiry', 5
where not exists (select 1 from galeria where imagem_url = '/images/torta-frango-catupiry.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/torta-caipira.jpg', 'Torta Caipira', 6
where not exists (select 1 from galeria where imagem_url = '/images/torta-caipira.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/torta-palmito.jpg', 'Torta de Palmito', 7
where not exists (select 1 from galeria where imagem_url = '/images/torta-palmito.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/pudim-chocolate.jpg', 'Pudim de Chocolate', 8
where not exists (select 1 from galeria where imagem_url = '/images/pudim-chocolate.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/pudim-leite-ninho.jpg', 'Pudim Leite Ninho', 9
where not exists (select 1 from galeria where imagem_url = '/images/pudim-leite-ninho.jpg');

-- ============================================================
-- SEED ADICIONAL — fotos novas (padrão Gemini) para os 3 produtos
-- originais, substituindo as fotos de Instagram por fotos no mesmo
-- estilo profissional dos demais itens do cardápio.
-- "update" é naturalmente idempotente: pode rodar quantas vezes quiser,
-- sempre convergindo para o mesmo resultado.
-- ============================================================
update produtos set imagem_url = '/images/torta-pentecostal.jpg'
where nome = 'Torta Pentecostal';

update produtos set imagem_url = '/images/torta-cachorro-quente.jpg'
where nome = 'Torta Cachorro Quente';

update produtos set imagem_url = '/images/pudim-perfeito.jpg'
where nome = 'Pudim Perfeito';

-- ============================================================
-- SEED ADICIONAL — fotos novas (padrão Gemini) na Galeria
-- Adicionadas como itens extras, mantendo as fotos originais do
-- Instagram que já estavam na galeria (intencional).
-- ============================================================
insert into galeria (imagem_url, legenda, ordem)
select '/images/torta-pentecostal.jpg', 'Torta Pentecostal', 10
where not exists (select 1 from galeria where imagem_url = '/images/torta-pentecostal.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/torta-cachorro-quente.jpg', 'Torta Cachorro Quente', 11
where not exists (select 1 from galeria where imagem_url = '/images/torta-cachorro-quente.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/pudim-perfeito.jpg', 'Pudim Perfeito', 12
where not exists (select 1 from galeria where imagem_url = '/images/pudim-perfeito.jpg');

-- ============================================================
-- SEED ADICIONAL — Mini Pudins (linha em alta: tradicional, coco,
-- chocolate e laranja). Pode ser rodado separadamente a qualquer
-- momento: os "not exists" evitam duplicar produtos/fotos, mesmo que
-- o schema.sql inteiro já tenha sido executado antes.
-- ============================================================
insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Mini Pudim Tradicional', 'A versão individual do nosso pudim clássico, com aquela calda de caramelo generosa. Perfeito para festas ou para se presentear sozinha.', 12.00, '/images/mini-pudim-tradicional.jpg', true, 4
from categorias where slug = 'pudins'
and not exists (select 1 from produtos where nome = 'Mini Pudim Tradicional');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Mini Pudim de Coco', 'Mini pudim cremoso com leite de coco, finalizado com coco ralado por cima — um toque tropical em cada mordida.', 13.00, '/images/mini-pudim-coco.jpg', false, 5
from categorias where slug = 'pudins'
and not exists (select 1 from produtos where nome = 'Mini Pudim de Coco');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Mini Pudim de Chocolate', 'Versão individual do pudim de chocolate, com calda generosa escorrendo por cima. Para quem não abre mão de um doce intenso.', 13.00, '/images/mini-pudim-chocolate.jpg', false, 6
from categorias where slug = 'pudins'
and not exists (select 1 from produtos where nome = 'Mini Pudim de Chocolate');

insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Mini Pudim de Laranja', 'Mini pudim refrescante com toque cítrico de laranja, finalizado com uma rodela fresca por cima.', 13.00, '/images/mini-pudim-laranja.jpg', false, 7
from categorias where slug = 'pudins'
and not exists (select 1 from produtos where nome = 'Mini Pudim de Laranja');

insert into galeria (imagem_url, legenda, ordem)
select '/images/mini-pudim-tradicional.jpg', 'Mini Pudim Tradicional', 13
where not exists (select 1 from galeria where imagem_url = '/images/mini-pudim-tradicional.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/mini-pudim-coco.jpg', 'Mini Pudim de Coco', 14
where not exists (select 1 from galeria where imagem_url = '/images/mini-pudim-coco.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/mini-pudim-chocolate.jpg', 'Mini Pudim de Chocolate', 15
where not exists (select 1 from galeria where imagem_url = '/images/mini-pudim-chocolate.jpg');

insert into galeria (imagem_url, legenda, ordem)
select '/images/mini-pudim-laranja.jpg', 'Mini Pudim de Laranja', 16
where not exists (select 1 from galeria where imagem_url = '/images/mini-pudim-laranja.jpg');

-- ============================================================
-- SEED ADICIONAL — Torta do Marinheiro (torta de sardinha). Pode ser
-- rodado separadamente a qualquer momento: os "not exists" evitam
-- duplicar produto/foto, mesmo que o schema.sql inteiro já tenha sido
-- executado antes.
-- ============================================================
insert into produtos (categoria_id, nome, descricao, preco, imagem_url, destaque, ordem)
select id, 'Torta do Marinheiro', 'Recheio farto de sardinha desfiada, molho e tomate fresco, ervilha, milho verde, cenoura ralada e um toque cremoso de requeijão. Sabor diferente, cheio de personalidade. Massa dourada e crocante.', 45.00, '/images/torta-marinheiro.jpg', false, 6
from categorias where slug = 'tortas'
and not exists (select 1 from produtos where nome = 'Torta do Marinheiro');

insert into galeria (imagem_url, legenda, ordem)
select '/images/torta-marinheiro.jpg', 'Torta do Marinheiro', 17
where not exists (select 1 from galeria where imagem_url = '/images/torta-marinheiro.jpg');
