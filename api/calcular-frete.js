import { cotarFrete } from './_lib/frete.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { rua, numero, bairro, cidade, uf, cep } = req.body || {};
  if (!rua || !numero || !bairro || !cidade || !uf) {
    return res.status(400).json({ error: 'Endereço incompleto' });
  }

  const enderecoTexto = `${rua}, ${numero} - ${bairro}, ${cidade} - ${uf}, ${cep || ''}`;

  try {
    const cotacao = await cotarFrete(enderecoTexto);
    return res.status(200).json(cotacao);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('Erro ao calcular frete:', err);
    return res.status(status).json({ error: err.message || 'Não foi possível calcular o frete' });
  }
}
