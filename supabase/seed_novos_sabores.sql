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
