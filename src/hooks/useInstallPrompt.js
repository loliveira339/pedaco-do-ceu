import { useEffect, useState } from 'react';

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Centraliza a lógica de instalação do PWA: no Android/desktop Chrome,
// captura o beforeinstallprompt para acionar depois via botão próprio
// (o Chrome não mostra mais o prompt nativo sozinho quando isso é feito).
// No iOS não existe esse evento — só resta orientar o usuário a instalar
// manualmente pelo menu de compartilhamento do Safari.
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    if (installed) return;

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [installed]);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return {
    canInstall: !!deferredPrompt,
    isIos: isIos() && !isStandalone(),
    installed,
    promptInstall,
  };
}
