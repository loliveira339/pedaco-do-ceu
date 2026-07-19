import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { cotarFrete } from './_lib/frete.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cliente, endereco, itens, forma_pagamento } = req.body || {};

  if (!cliente?.nome || !cliente?.telefone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }
  if (!endereco?.rua || !endereco?.numero || !endereco?.bairro || !endereco?.cidade || !endereco?.uf) {
    return res.status(400).json({ error: 'Endereço incompleto' });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'O carrinho está vazio' });
  }
  if (!['cartao', 'pix', 'boleto'].includes(forma_pagamento)) {
    return res.status(400).json({ error: 'Forma de pagamento inválida' });
  }

  try {
    // Nunca confiar no preço que veio do carrinho do client — busca os
    // valores reais e atuais no banco antes de gravar o pedido.
    const produtoIds = itens.map((i) => i.produto_id);
    const { data: produtosReais, error: erroProdutos } = await supabaseAdmin
      .from('produtos')
      .select('id, nome, preco')
      .in('id', produtoIds);

    if (erroProdutos) throw erroProdutos;

    const itensValidados = itens.map((item) => {
      const produto = produtosReais.find((p) => p.id === item.produto_id);
      if (!produto) {
        const err = new Error(`Produto não encontrado ou indisponível`);
        err.status = 422;
        throw err;
      }
      return {
        produto_id: produto.id,
        produto_nome: produto.nome,
        preco_unitario: produto.preco,
        quantidade: item.quantidade,
      };
    });

    const valorSubtotal = itensValidados.reduce(
      (soma, i) => soma + i.preco_unitario * i.quantidade,
      0
    );

    // Revalida o frete no servidor em vez de confiar no valor calculado
    // no client — mesma lógica usada em /api/calcular-frete.
    const enderecoTexto = `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}, ${endereco.cep || ''}`;
    const cotacao = await cotarFrete(enderecoTexto);

    const valorTotal = Math.round((valorSubtotal + cotacao.valor_frete) * 100) / 100;

    const { data: pedido, error: erroPedido } = await supabaseAdmin
      .from('pedidos')
      .insert({
        cliente_nome: cliente.nome,
        cliente_telefone: cliente.telefone,
        cliente_email: cliente.email || null,
        endereco_cep: endereco.cep || null,
        endereco_rua: endereco.rua,
        endereco_numero: endereco.numero,
        endereco_complemento: endereco.complemento || null,
        endereco_bairro: endereco.bairro,
        endereco_cidade: endereco.cidade,
        endereco_uf: endereco.uf,
        endereco_lat: cotacao.lat,
        endereco_lng: cotacao.lng,
        distancia_km: cotacao.distancia_km,
        valor_frete: cotacao.valor_frete,
        meio_entrega: cotacao.meio_entrega,
        valor_subtotal: valorSubtotal,
        valor_total: valorTotal,
        forma_pagamento,
        status: 'aguardando_pagamento',
        observacoes: cliente.observacoes || null,
      })
      .select()
      .single();

    if (erroPedido) throw erroPedido;

    const itensParaInserir = itensValidados.map((i) => ({ ...i, pedido_id: pedido.id }));
    const { error: erroItens } = await supabaseAdmin.from('pedido_itens').insert(itensParaInserir);
    if (erroItens) throw erroItens;

    // TODO (Fase 3): chamar o checkout PagBank aqui e retornar checkout_url
    // pro client redirecionar. Por enquanto retorna sucesso direto.
    return res.status(200).json({ pedido_id: pedido.id, valor_total: valorTotal });
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('Erro ao criar pedido:', err);
    return res.status(status).json({ error: err.message || 'Não foi possível criar o pedido' });
  }
}
