import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { whatsappLink } from '../lib/supabaseClient';

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur border-t border-brown/10 px-4 pt-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
        >
          <a
            href={whatsappLink('Olá! Vim pelo site e gostaria de fazer um pedido 🍰')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
          >
            Pedir agora pelo WhatsApp
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
