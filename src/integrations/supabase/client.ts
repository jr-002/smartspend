import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use project configuration directly as provided by Lovable
const SUPABASE_URL = 'https://gxvsmnmgrxovbsmdkdqf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dnNtbm1ncnhvdmJzbWRrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTkyNTcsImV4cCI6MjA2ODA5NTI1N30.F2EPZdwx8Y7XTV1hqb4sas3kiUK77GzHuuqbh-Ah1ik';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});