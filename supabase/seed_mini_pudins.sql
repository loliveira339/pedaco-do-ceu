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
