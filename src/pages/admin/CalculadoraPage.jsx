import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Check } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import Field from '../../components/admin/Field';
import { calcularPrecificacao, formatBRL, formatBRL4 } from '../../utils/precificacao';

const NOVA_LINHA = () => ({
  id: crypto.randomUUID(),
  ingrediente_id: '',
  nome: '',
  quantidade: '',
  custo_unitario: '',
  modoCusto: 'embalagem', // 'embalagem' | 'manual'
  precoEmbalagem: '',
  pesoEmbalagem: '',
});

const custoUnitarioDaLinha = (l) =>
  l.modoCusto === 'embalagem'
    ? (Number(l.precoEmbalagem) || 0) / (Number(l.pesoEmbalagem) || 1)
    : Number(l.custo_unitario) || 0;

export default function CalculadoraPage() {
  const { items: ingredientesCadastrados, create: createIngrediente } = useCrud('ingredientes', { orderBy: 'nome' });
  const { items: produtosCadastrados, update: updateProduto } = useCrud('produtos', { orderBy: 'nome' });
  const [searchParams] = useSearchParams();

  const [produtoId, setProdutoId] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [aplicando, setAplicando] = useState(false);
  const [linhas, setLinhas] = useState([NOVA_LINHA()]);
  const [pesoFinalG, setPesoFinalG] = useState('');
  const [rendimentoUnidades, setRendimentoUnidades] = useState('1');
  const [percentualDesperdicio, setPercentualDesperdicio] = useState('5');
  const [margemDesejada, setMargemDesejada] = useState('30');
  const [custos, setCustos] = useState({ embalagem: '', gas: '', energia: '', maoDeObra: '', entrega: '', outros: '' });
  const [saving, setSaving] = useState(false);

  const addLinha = () => setLinhas((ls) => [...ls, NOVA_LINHA()]);
  const removeLinha = (id) => setLinhas((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : ls));

  const updateLinha = (id, patch) => setLinhas((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const handleSelectIngrediente = (id, ingredienteId) => {
    const ing = ingredientesCadastrados.find((i) => String(i.id) === String(ingredienteId));
    updateLinha(id, {
      ingrediente_id: ingredienteId,
      nome: ing?.nome || '',
      custo_unitario: ing?.custo_unitario ?? '',
      modoCusto: 'manual',
    });
  };

  const handleSelectProduto = (id) => {
    const prod = produtosCadastrados.find((p) => String(p.id) === String(id));
    setProdutoId(id);
    setProdutoNome(prod?.nome || '');
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('produto');
    if (idFromUrl && produtosCadastrados.length > 0 && !produtoId) {
      handleSelectProduto(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, produtosCadastrados]);

  const resultado = useMemo(
    () =>
      calcularPrecificacao({
        ingredientes: linhas.map((l) => ({ ...l, custo_unitario: custoUnitarioDaLinha(l) })),
        pesoFinalG,
        rendimentoUnidades,
        percentualDesperdicio,
        margemDesejada,
        custosIndiretos: custos,
      }),
    [linhas, pesoFinalG, rendimentoUnidades, percentualDesperdicio, margemDesejada, custos]
  );

  // Ingredientes digitados "na mão" (sem vir da lista já cadastrada) são salvos
  // automaticamente em Ingredientes na primeira vez, para poderem ser reaproveitados
  // em outras receitas sem precisar redigitar nome/custo.
  const salvarIngredientesNovos = async () => {
    const linhasAtualizadas = [...linhas];
    for (let i = 0; i < linhasAtualizadas.length; i++) {
      const l = linhasAtualizadas[i];
      if (l.ingrediente_id || !l.nome.trim()) continue;

      const jaExiste = ingredientesCadastrados.some(
        (ing) => ing.nome.trim().toLowerCase() === l.nome.trim().toLowerCase()
      );
      if (jaExiste) continue;

      const custoUnitario = custoUnitarioDaLinha(l);
      if (custoUnitario <= 0) continue;

      const { data } = await createIngrediente({
        nome: l.nome.trim(),
        unidade_medida: 'g',
        custo_unitario: custoUnitario,
      });
      if (data) {
        linhasAtualizadas[i] = { ...l, ingrediente_id: data.id };
      }
    }
    setLinhas(linhasAtualizadas);
    return linhasAtualizadas;
  };

  const handleSalvar = async (linhasParaSalvar = linhas) => {
    if (!isSupabaseConfigured) {
      toast.error('Configure o Supabase (.env) para salvar o histórico de cálculos.');
      return;
    }
    if (!produtoNome) {
      toast.error('Informe o nome do produto antes de salvar.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('calculos_precificacao').insert({
      produto_id: produtoId || null,
      produto_nome: produtoNome,
      peso_final_g: Number(pesoFinalG) || 0,
      rendimento_unidades: Number(rendimentoUnidades) || 1,
      percentual_desperdicio: Number(percentualDesperdicio) || 0,
      margem_desejada: Number(margemDesejada) || 0,
      custo_embalagem: Number(custos.embalagem) || 0,
      custo_gas: Number(custos.gas) || 0,
      custo_energia: Number(custos.energia) || 0,
      custo_mao_obra: Number(custos.maoDeObra) || 0,
      custo_entrega: Number(custos.entrega) || 0,
      custo_outros: Number(custos.outros) || 0,
      ingredientes_json: linhasParaSalvar.map((l) => ({ ...l, custo_unitario: custoUnitarioDaLinha(l) })),
      custo_ingredientes: resultado.custoIngredientes,
      custo_total: resultado.custoTotalReceita,
      custo_por_kg: resultado.custoPorKg,
      custo_por_unidade: resultado.custoPorUnidade,
      preco_minimo: resultado.precoMinimoVenda,
      preco_ideal: resultado.precoIdealVenda,
      lucro_por_unidade: resultado.lucroPorUnidade,
      margem_real: resultado.margemLucroReal,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Cálculo salvo no histórico!');
  };

  const handleAplicarPreco = async () => {
    if (!produtoId) {
      toast.error('Selecione um produto do cardápio para aplicar o preço.');
      return;
    }
    setAplicando(true);
    const linhasAtualizadas = await salvarIngredientesNovos();
    const { error } = await updateProduto(produtoId, { preco: resultado.precoIdealVenda });
    setAplicando(false);
    if (!error) {
      await handleSalvar(linhasAtualizadas);
    }
  };

  const handleSalvarHistorico = async () => {
    const linhasAtualizadas = await salvarIngredientesNovos();
    await handleSalvar(linhasAtualizadas);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-brown-dark">Calculadora Inteligente de Precificação</h1>
      <p className="text-sm text-brown/60 mt-1">
        Informe os ingredientes e custos da receita para descobrir o preço ideal de venda.
      </p>

      <div className="grid lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-5 space-y-3">
            <Field label="Produto do cardápio (opcional)" as="select" value={produtoId} onChange={handleSelectProduto}>
              <option value="">Não vincular a um produto…</option>
              {produtosCadastrados.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Field>
            {produtoId ? (
              <p className="text-xs text-brown/60">
                Vinculado a <strong className="text-brown-dark">{produtoNome}</strong>. Ao aplicar o preço, o
                cardápio público é atualizado automaticamente.
              </p>
            ) : (
              <Field label="Nome do produto (para salvar no histórico)" value={produtoNome} onChange={setProdutoNome} required />
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-brown-dark text-sm">Ingredientes</h3>
              <button onClick={addLinha} type="button" className="flex items-center gap-1 text-xs font-semibold text-gold-dark hover:underline">
                <Plus size={14} /> Adicionar ingrediente
              </button>
            </div>
            <p className="text-xs text-brown/50 -mt-1 mb-3">
              Ingredientes digitados aqui (não escolhidos da lista) são salvos automaticamente em
              "Ingredientes" ao salvar o cálculo, prontos para reusar em outras receitas.
            </p>

            <div className="space-y-4">
              {linhas.map((l) => (
                <div key={l.id} className="border border-brown/10 rounded-xl p-3">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-5">
                      <label className="text-[11px] font-semibold text-brown-dark uppercase tracking-wide">Ingrediente</label>
                      <select
                        value={l.ingrediente_id}
                        onChange={(e) => handleSelectIngrediente(l.id, e.target.value)}
                        className="mt-1 w-full border border-brown/15 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none focus:border-gold-dark"
                      >
                        <option value="">Manual…</option>
                        {ingredientesCadastrados.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
                      </select>
                      {!l.ingrediente_id && (
                        <input
                          placeholder="Nome do ingrediente"
                          value={l.nome}
                          onChange={(e) => updateLinha(l.id, { nome: e.target.value })}
                          className="mt-1.5 w-full border border-brown/15 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none focus:border-gold-dark"
                        />
                      )}
                    </div>
                    <div className="col-span-8 sm:col-span-6">
                      <label className="text-[11px] font-semibold text-brown-dark uppercase tracking-wide">Qtd. usada na receita (g/ml/un)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={l.quantidade}
                        onChange={(e) => updateLinha(l.id, { quantidade: e.target.value })}
                        className="mt-1 w-full border border-brown/15 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none focus:border-gold-dark"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-1 flex justify-end">
                      <button type="button" onClick={() => removeLinha(l.id)} className="p-2 text-rose hover:bg-rose/10 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {!l.ingrediente_id && (
                    <div className="mt-3 pt-3 border-t border-brown/10">
                      <div className="flex gap-2 mb-2.5">
                        <button
                          type="button"
                          onClick={() => updateLinha(l.id, { modoCusto: 'embalagem' })}
                          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${l.modoCusto === 'embalagem' ? 'bg-gold/20 text-brown-dark' : 'text-brown/50 hover:bg-cream'}`}
                        >
                          Calcular pelo preço da embalagem
                        </button>
                        <button
                          type="button"
                          onClick={() => updateLinha(l.id, { modoCusto: 'manual' })}
                          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${l.modoCusto === 'manual' ? 'bg-gold/20 text-brown-dark' : 'text-brown/50 hover:bg-cream'}`}
                        >
                          Já sei o custo unitário
                        </button>
                      </div>

                      {l.modoCusto === 'embalagem' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-brown-dark uppercase tracking-wide">Preço da embalagem (R$)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={l.precoEmbalagem}
                              onChange={(e) => updateLinha(l.id, { precoEmbalagem: e.target.value })}
                              className="mt-1 w-full border border-brown/15 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none focus:border-gold-dark"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-brown-dark uppercase tracking-wide">Peso/volume da embalagem</label>
                            <input
                              type="number"
                              step="0.01"
                              value={l.pesoEmbalagem}
                              onChange={(e) => updateLinha(l.id, { pesoEmbalagem: e.target.value })}
                              className="mt-1 w-full border border-brown/15 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none focus:border-gold-dark"
                            />
                          </div>
                          <p className="col-span-2 text-xs text-brown/60">
                            Custo unitário calculado: <span className="font-semibold text-brown-dark">{formatBRL4(custoUnitarioDaLinha(l))}</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="text-[11px] font-semibold text-brown-dark uppercase tracking-wide">Custo unit. (R$)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={l.custo_unitario}
                            onChange={(e) => updateLinha(l.id, { custo_unitario: e.target.value })}
                            className="mt-1 w-full border border-brown/15 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none focus:border-gold-dark"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 grid sm:grid-cols-2 gap-4">
            <Field label="Peso final da receita (g)" type="number" value={pesoFinalG} onChange={setPesoFinalG} />
            <Field label="Rendimento (nº de unidades)" type="number" value={rendimentoUnidades} onChange={setRendimentoUnidades} />
            <Field label="% de desperdício" type="number" step="0.1" value={percentualDesperdicio} onChange={setPercentualDesperdicio} />
            <Field label="Margem de lucro desejada (%)" type="number" step="0.1" value={margemDesejada} onChange={setMargemDesejada} />
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-brown-dark text-sm mb-3">Custos indiretos (R$)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Embalagem" type="number" step="0.01" value={custos.embalagem} onChange={(v) => setCustos({ ...custos, embalagem: v })} />
              <Field label="Gás" type="number" step="0.01" value={custos.gas} onChange={(v) => setCustos({ ...custos, gas: v })} />
              <Field label="Energia" type="number" step="0.01" value={custos.energia} onChange={(v) => setCustos({ ...custos, energia: v })} />
              <Field label="Mão de obra" type="number" step="0.01" value={custos.maoDeObra} onChange={(v) => setCustos({ ...custos, maoDeObra: v })} />
              <Field label="Entrega" type="number" step="0.01" value={custos.entrega} onChange={(v) => setCustos({ ...custos, entrega: v })} />
              <Field label="Outros" type="number" step="0.01" value={custos.outros} onChange={(v) => setCustos({ ...custos, outros: v })} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-5 sticky top-6 bg-brown-dark text-cream rounded-2xl shadow-card">
            <h3 className="font-display font-semibold text-lg mb-4">Resultado</h3>
            <dl className="space-y-2.5 text-sm">
              <Row label="Custo dos ingredientes" value={formatBRL(resultado.custoIngredientes)} />
              <Row label="Custo do desperdício" value={formatBRL(resultado.custoDesperdicio)} />
              <Row label="Custos indiretos" value={formatBRL(resultado.custoIndiretosTotal)} />
              <Row label="Custo total da receita" value={formatBRL(resultado.custoTotalReceita)} strong />
              <div className="h-px bg-cream/15 my-2" />
              <Row label="Custo por kg" value={formatBRL(resultado.custoPorKg)} />
              <Row label="Custo por unidade" value={formatBRL(resultado.custoPorUnidade)} />
              <div className="h-px bg-cream/15 my-2" />
              <Row label="Preço mínimo de venda" value={formatBRL(resultado.precoMinimoVenda)} />
              <Row label="Preço ideal de venda" value={formatBRL(resultado.precoIdealVenda)} strong gold />
              <Row label="Lucro por unidade" value={formatBRL(resultado.lucroPorUnidade)} />
              <Row label="Margem de lucro real" value={`${resultado.margemLucroReal.toFixed(1)}%`} />
            </dl>

            {produtoId && (
              <button
                onClick={handleAplicarPreco}
                disabled={aplicando || saving}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-gold text-brown-dark font-semibold py-3 rounded-full hover:brightness-105 transition disabled:opacity-60"
              >
                <Check size={17} /> {aplicando ? 'Aplicando…' : `Aplicar ${formatBRL(resultado.precoIdealVenda)} ao produto`}
              </button>
            )}

            <button
              onClick={handleSalvarHistorico}
              disabled={saving || aplicando}
              className={`mt-2.5 w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-full transition disabled:opacity-60 ${
                produtoId ? 'bg-cream/10 text-cream hover:bg-cream/15' : 'bg-gold text-brown-dark hover:brightness-105'
              }`}
            >
              <Save size={17} /> {saving ? 'Salvando…' : 'Salvar cálculo no histórico'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong = false, gold = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cream/70">{label}</dt>
      <dd className={`${strong ? 'font-bold text-base' : 'font-medium'} ${gold ? 'text-gold' : ''}`}>{value}</dd>
    </div>
  );
}
