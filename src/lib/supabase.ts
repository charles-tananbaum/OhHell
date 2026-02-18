import { createClient } from '@supabase/supabase-js';

// Vite inlines env vars at build time. Fallback to hardcoded values
// for the public anon key (safe to expose — RLS protects the data).
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://jnikgtogqsfpbgmjcvtn.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWtndG9ncXNmcGJnbWpjdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODM0MjEsImV4cCI6MjA4Njk1OTQyMX0.Xp0k8yrz4zvDF-G93USvEIwEWHehVlinDdUSHXQHtEU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return true;
}
