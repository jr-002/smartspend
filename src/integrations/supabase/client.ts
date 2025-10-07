import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Lovable doesn't support VITE_* env vars, use hardcoded Supabase credentials
const supabaseUrl = 'https://gxvsmnmgrxovbsmdkdqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dnNtbm1ncnhvdmJzbWRrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTkyNTcsImV4cCI6MjA2ODA5NTI1N30.F2EPZdwx8Y7XTV1hqb4sas3kiUK77GzHuuqbh-Ah1ik';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});