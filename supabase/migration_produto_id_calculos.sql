-- ============================================================
-- Migration: vincula histórico de cálculos de precificação a um produto
-- Rode no SQL Editor do Supabase se o schema.sql já tinha sido aplicado antes
-- (quem estiver rodando o schema.sql do zero não precisa deste arquivo).
-- ============================================================

alter table calculos_precificacao
  add column if not exists produto_id uuid references produtos(id) on delete set null;
