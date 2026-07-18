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
