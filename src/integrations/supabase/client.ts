import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { requestQueue } from '@/lib/performance';

// Environment-aware configuration for deployment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gxvsmnmgrxovbsmdkdqf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dnNtbm1ncnhvdmJzbWRrZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTkyNTcsImV4cCI6MjA2ODA5NTI1N30.F2EPZdwx8Y7XTV1hqb4sas3kiUK77GzHuuqbh-Ah1ik';

const baseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Create a wrapper that queues requests to prevent overwhelming the API
export const supabase = new Proxy(baseClient, {
  get(target, prop) {
    const value = target[prop as keyof typeof target];
    
    if (prop === 'from') {
      return (table: string) => {
        const tableClient = target.from(table);
        
        // Wrap select operations in the request queue
        return new Proxy(tableClient, {
          get(tableTarget, tableProp) {
            const tableValue = tableTarget[tableProp as keyof typeof tableTarget];
            
            if (tableProp === 'select' && typeof tableValue === 'function') {
              return (...args: unknown[]) => {
                const query = tableValue.apply(tableTarget, args);
                
                // Wrap the final execution methods
                return new Proxy(query, {
                  get(queryTarget, queryProp) {
                    const queryValue = queryTarget[queryProp as keyof typeof queryTarget];
                    
                    if (typeof queryValue === 'function' && 
                        (queryProp === 'then' || queryProp === 'catch' || queryProp === 'finally')) {
                      // This is a Promise method, queue the request
                      return (...promiseArgs: unknown[]) => {
                        return requestQueue.add(() => queryValue.apply(queryTarget, promiseArgs));
                      };
                    }
                    
                    return queryValue;
                  }
                });
              };
            }
            
            return tableValue;
          }
        });
      };
    }
    
    return value;
  }
});