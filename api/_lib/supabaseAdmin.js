import { createClient } from '@supabase/supabase-js';

// Client server-side only, com service role key (ignora RLS). Nunca deve
// ser importado em código que roda no browser — só dentro de /api.
// Reaproveita a mesma URL pública do Supabase, só troca a key.
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
