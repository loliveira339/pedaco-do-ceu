import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const DISPENSADO_KEY = 'pdc_install_prompt_dispensado_em';
const DIAS_ATE_REAPARECER = 14;

function foiDispensadoRecentemente() {
  const salvo = localStorage.getItem(DISPENSADO_KEY);
  if (!salvo) return false;
  const dias = (Date.now() - Number(salvo)) / (1000 * 60 * 60 * 24);
  return dias < DIAS_ATE_REAPARECER;
}

export default function InstallPrompt() {
  const { canInstall, isIos, installed, promptInstall } = useInstallPrompt();
  const [visivel, setVisivel] = useState(false);
  const [mostrarPassoIos, setMostrarPassoIos] = useState(false);

  useEffect(() => {
    if (installed || foiDispensadoRecentemente()) return;
    if (!canInstall && !isIos) return;

    const timer = setTimeout(() => setVisivel(true), 4000);
    return () => clearTimeout(timer);
  }, [canInstall, isIos, installed]);

  const dispensar = () => {
    localStorage.setItem(DISPENSADO_KEY, String(Date.now()));
    setVisivel(false);
  };

  const instalar = async () => {
    if (isIos) {
      setMostrarPassoIos(true);
      return;
    }
    await promptInstall();
    setVisivel(false);
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 sm:bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 sm:max-w-sm z-40 bg-white rounded-2xl shadow-soft border border-brown/10 p-4"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            onClick={dispensar}
            aria-label="Fechar"
            className="absolute top-2 right-2 p-1.5 text-brown-light/60 hover:text-brown transition-colors"
          >
            <X size={18} />
          </button>

          {!mostrarPassoIos ? (
            <div className="flex items-start gap-3 pr-5">
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-brown/10">
                <img src="/icons/icon-192.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-brown text-sm">
                  Instale o app Pedaço do Céu
                </p>
                <p className="text-xs text-brown-light mt-0.5">
                  Acesso rápido pelo seu celular, sem precisar do navegador.
                </p>
                <button
                  onClick={instalar}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brown hover:bg-brown-dark transition-colors px-4 py-2 rounded-full"
                >
                  <Download size={16} />
                  Instalar
                </button>
              </div>
            </div>
          ) : (
            <div className="pr-5">
              <p className="font-display font-semibold text-brown text-sm mb-2">
                Para instalar no iPhone:
              </p>
              <ol className="text-xs text-brown-light space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cream-deep flex items-center justify-center shrink-0 font-semibold text-brown">1</span>
                  Toque em <Share size={14} className="inline mx-0.5" /> (Compartilhar) na barra do Safari
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cream-deep flex items-center justify-center shrink-0 font-semibold text-brown">2</span>
                  Escolha <PlusSquare size={14} className="inline mx-0.5" /> "Adicionar à Tela de Início"
                </li>
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
