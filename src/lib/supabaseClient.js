import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sinaliza claramente quando o projeto ainda não tem credenciais reais —
// o site continua funcionando com conteúdo de exemplo (ver src/data/seedFallback.js)
// até a Milena (ou quem configurar) criar o projeto Supabase e preencher o .env.
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('SEU-PROJETO')
);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5511976858856';

export function whatsappLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
