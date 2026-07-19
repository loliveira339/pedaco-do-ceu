-- ============================================================
-- Pedaço do Céu — Migration: Encomendas online (pedidos)
-- Rode este arquivo no SQL Editor do Supabase, depois do schema.sql
-- ============================================================

create table if not exists pedidos (
  id uuid primary key default uuid_generate_v4(),

  -- Cliente
  cliente_nome text not null,
  cliente_telefone text not null, -- WhatsApp, formato E.164 sem símbolos (ex: 5511999999999)
  cliente_email text,

  -- Endereço estruturado
  endereco_cep text not null,
  endereco_rua text not null,
  endereco_numero text not null,
  endereco_complemento text,
  endereco_bairro text not null,
  endereco_cidade text not null,
  endereco_uf text not null,
  endereco_lat numeric(10,6),
  endereco_lng numeric(10,6),

  -- Frete
  distancia_km numeric(6,2),
  valor_frete numeric(12,2) not null default 0,
  meio_entrega text not null default 'moto' check (meio_entrega in ('moto','carro')),

  -- Valores
  valor_subtotal numeric(12,2) not null default 0,
  valor_total numeric(12,2) not null default 0,

  -- Pagamento
  forma_pagamento text not null check (forma_pagamento in ('cartao','boleto','pix')),
  pagbank_reference_id text unique,
  pagbank_checkout_id text,
  pagbank_status text, -- último status bruto recebido no webhook (ex: PAID, DECLINED)

  -- Status interno do pedido (fluxo operacional da confeitaria)
  status text not null default 'aguardando_pagamento' check (status in (
    'aguardando_pagamento', 'pago', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado'
  )),
  prazo_entrega timestamptz,
  observacoes text, -- texto livre do cliente (ex: ponto de referência)
  mensagem_admin text, -- última mensagem que a admin registrou pro cliente (auditoria simples)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pedido_itens (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id uuid references produtos(id) on delete set null,
  produto_nome text not null, -- snapshot do nome no momento da compra
  preco_unitario numeric(12,2) not null,
  quantidade int not null default 1 check (quantidade > 0)
);

create index if not exists idx_pedido_itens_pedido_id on pedido_itens(pedido_id);
create index if not exists idx_pedidos_status on pedidos(status);
create index if not exists idx_pedidos_created_at on pedidos(created_at desc);

-- trigger simples pra manter updated_at em dia (pedidos muda de status com frequência)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pedidos_updated_at on pedidos;
create trigger trg_pedidos_updated_at
  before update on pedidos
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- pedidos é a PRIMEIRA tabela com insert público (cliente sem login).
-- Leitura/edição continuam exclusivas da admin autenticada. O insert
-- público é usado como defesa em profundidade — as funções serverless
-- gravam via service role (que ignora RLS), mas a policy documenta a
-- intenção e permite trocar a implementação por anon key no futuro.
-- ============================================================
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;

create policy "pedidos_insert_public" on pedidos for insert with check (true);
create policy "pedidos_select_auth" on pedidos for select using (auth.role() = 'authenticated');
create policy "pedidos_update_auth" on pedidos for update using (auth.role() = 'authenticated');
create policy "pedidos_delete_auth" on pedidos for delete using (auth.role() = 'authenticated');

create policy "pedido_itens_insert_public" on pedido_itens for insert with check (true);
create policy "pedido_itens_select_auth" on pedido_itens for select using (auth.role() = 'authenticated');
create policy "pedido_itens_update_auth" on pedido_itens for update using (auth.role() = 'authenticated');
create policy "pedido_itens_delete_auth" on pedido_itens for delete using (auth.role() = 'authenticated');
