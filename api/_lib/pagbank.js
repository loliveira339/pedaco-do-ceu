// Integração com o Checkout PagBank (link de pagamento hospedado — cartão,
// PIX e boleto, conforme habilitado na conta). Replica o padrão já usado no
// backend do Vendedor Alfa (mesma conta/token por enquanto).

function baseUrl() {
  return process.env.PAGBANK_ENV === 'production'
    ? 'https://api.pagseguro.com'
    : 'https://sandbox.api.pagseguro.com';
}

// Cria um checkout hospedado no PagBank e retorna a URL de pagamento.
// `pedidoId` vira o reference_id no formato "PEDIDO:{uuid}" — é como o
// webhook identifica qual pedido atualizar quando o pagamento é confirmado.
export async function criarCheckoutPagBank({ pedidoId, clienteNome, clienteEmail, valorTotal }) {
  const referenceId = `PEDIDO:${pedidoId}`;

  const payload = {
    reference_id: referenceId,
    customer: {
      name: clienteNome,
      email: clienteEmail || `pedido+${pedidoId}@pedacodoceudelicias.com.br`,
    },
    items: [
      {
        reference_id: pedidoId,
        name: 'Encomenda Pedaço do Céu',
        quantity: 1,
        unit_amount: Math.round(valorTotal * 100),
      },
    ],
    redirect_url: `${process.env.SITE_URL}/pedido/sucesso`,
    notification_urls: [`${process.env.SITE_URL}/api/pagbank-webhook`],
  };

  const resp = await fetch(`${baseUrl()}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await resp.text();
  if (!resp.ok) {
    throw new Error(`PagBank respondeu HTTP ${resp.status}: ${bodyText.slice(0, 500)}`);
  }

  const data = JSON.parse(bodyText);
  const checkoutUrl = data.links?.find((l) => l.rel === 'PAY')?.href;
  if (!checkoutUrl) {
    throw new Error('PagBank não retornou um link de pagamento (rel: PAY)');
  }

  return { checkoutUrl, checkoutId: data.id, referenceId };
}
