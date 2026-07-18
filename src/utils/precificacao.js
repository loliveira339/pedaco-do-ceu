// Motor de cálculo da Calculadora Inteligente de Precificação.
// Fórmulas puras (sem side-effects) para poderem ser testadas isoladamente.
//
// Importante: a margem de lucro é aplicada sobre o PREÇO DE VENDA (markup sobre
// preço), não sobre o custo. Isso garante que uma margem desejada de, por exemplo,
// 30% realmente resulte em 30% de lucro sobre o preço final — e não ~23%, como
// aconteceria se a margem fosse aplicada só sobre o custo (erro comum).

/**
 * @param {Object} input
 * @param {Array<{quantidade:number, custo_unitario:number}>} input.ingredientes
 * @param {number} input.pesoFinalG - peso final da receita em gramas
 * @param {number} input.rendimentoUnidades - quantas unidades a receita rende
 * @param {number} input.percentualDesperdicio - 0-100
 * @param {number} input.margemDesejada - 0-100 (% sobre o preço de venda)
 * @param {Object} input.custosIndiretos - { embalagem, gas, energia, maoDeObra, entrega, outros }
 */
export function calcularPrecificacao({
  ingredientes = [],
  pesoFinalG = 0,
  rendimentoUnidades = 1,
  percentualDesperdicio = 0,
  margemDesejada = 0,
  custosIndiretos = {},
}) {
  const custoIngredientes = ingredientes.reduce(
    (soma, item) => soma + (Number(item.quantidade) || 0) * (Number(item.custo_unitario) || 0),
    0
  );

  const custoDesperdicio = custoIngredientes * ((Number(percentualDesperdicio) || 0) / 100);

  const {
    embalagem = 0,
    gas = 0,
    energia = 0,
    maoDeObra = 0,
    entrega = 0,
    outros = 0,
  } = custosIndiretos;

  const custoIndiretosTotal =
    (Number(embalagem) || 0) +
    (Number(gas) || 0) +
    (Number(energia) || 0) +
    (Number(maoDeObra) || 0) +
    (Number(entrega) || 0) +
    (Number(outros) || 0);

  const custoTotalReceita = custoIngredientes + custoDesperdicio + custoIndiretosTotal;

  const pesoFinalKg = (Number(pesoFinalG) || 0) / 1000;
  const custoPorKg = pesoFinalKg > 0 ? custoTotalReceita / pesoFinalKg : 0;

  const unidades = Number(rendimentoUnidades) || 1;
  const custoPorUnidade = unidades > 0 ? custoTotalReceita / unidades : 0;

  const margem = Math.min(Math.max(Number(margemDesejada) || 0, 0), 99);

  const precoMinimoVenda = custoPorUnidade;
  const precoIdealVenda = margem > 0 ? custoPorUnidade / (1 - margem / 100) : custoPorUnidade;

  const lucroPorUnidade = precoIdealVenda - custoPorUnidade;
  const margemLucroReal = precoIdealVenda > 0 ? (lucroPorUnidade / precoIdealVenda) * 100 : 0;

  return {
    custoIngredientes: round2(custoIngredientes),
    custoDesperdicio: round2(custoDesperdicio),
    custoIndiretosTotal: round2(custoIndiretosTotal),
    custoTotalReceita: round2(custoTotalReceita),
    custoPorKg: round2(custoPorKg),
    custoPorUnidade: round2(custoPorUnidade),
    precoMinimoVenda: round2(precoMinimoVenda),
    precoIdealVenda: round2(precoIdealVenda),
    lucroPorUnidade: round2(lucroPorUnidade),
    margemLucroReal: round2(margemLucroReal),
  };
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function formatBRL(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatBRL4(value) {
  return (Number(value) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}
