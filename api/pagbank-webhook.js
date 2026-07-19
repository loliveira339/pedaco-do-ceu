import { supabaseAdmin } from './_lib/supabaseAdmin.js';

// Recebe notificações assíncronas do PagBank sobre mudanças de status de
// pagamento. Sempre responde 200 rapidamente — qualquer erro de lógica
// interna é só logado, nunca propagado como status HTTP de erro (evita
// que o PagBank fique reenviando o webhook indefinidamente).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { charges, reference_id: rootReferenceId } = req.body || {};
    const status = charges?.[0]?.status;
    const referenceId = rootReferenceId || charges?.[0]?.reference_id;

    if (referenceId?.startsWith('PEDIDO:')) {
      const pedidoId = referenceId.split(':')[1];
      const update = { pagbank_status: status || null };
      if (status === 'PAID') update.status = 'pago';

      const { error } = await supabaseAdmin.from('pedidos').update(update).eq('id', pedidoId);
      if (error) console.error('Erro ao atualizar pedido via webhook:', error);
    }
  } catch (err) {
    console.error('Erro ao processar webhook PagBank:', err);
  }

  return res.status(200).send('OK');
}
