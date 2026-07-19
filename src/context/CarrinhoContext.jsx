import React, { createContext, useContext, useEffect, useState } from 'react';

const CarrinhoContext = createContext(null);
const STORAGE_KEY = 'pedaco-carrinho';

function lerCarrinhoSalvo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(lerCarrinhoSalvo);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  }, [itens]);

  const adicionar = (produto) => {
    setItens((atual) => {
      const existente = atual.find((i) => i.produto_id === produto.id);
      if (existente) {
        return atual.map((i) =>
          i.produto_id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [
        ...atual,
        {
          produto_id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          imagem_url: produto.imagem_url,
          quantidade: 1,
        },
      ];
    });
  };

  const remover = (produtoId) => {
    setItens((atual) => atual.filter((i) => i.produto_id !== produtoId));
  };

  const alterarQuantidade = (produtoId, quantidade) => {
    if (quantidade <= 0) {
      remover(produtoId);
      return;
    }
    setItens((atual) => atual.map((i) => (i.produto_id === produtoId ? { ...i, quantidade } : i)));
  };

  const limpar = () => setItens([]);

  const subtotal = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, remover, alterarQuantidade, limpar, subtotal, totalItens }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error('useCarrinho precisa estar dentro de um CarrinhoProvider');
  return ctx;
}
