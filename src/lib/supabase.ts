import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = supabaseUrl && supabaseUrl !== 'https://your-project-id.supabase.co' && supabaseUrl !== '';

if (!isConfigured) {
  console.error('Supabase Error: Credenciales no configuradas. Por favor, añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el panel de Secrets de AI Studio.');
}

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder'
);
