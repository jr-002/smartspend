import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '../../lib/environment';


export const supabase = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});