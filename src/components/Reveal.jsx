import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Wrapper de animação de entrada ao rolar a página.
 * `once` garante que a animação não repete a cada scroll (mais profissional
 * que ficar "piscando" elementos toda vez que entram/saem da viewport).
 */
export default function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const Comp = motion[as] || motion.div;

  return (
    <Comp
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}
