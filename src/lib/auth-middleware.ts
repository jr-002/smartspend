// Enhanced authentication middleware for secure API operations
import { supabase } from '@/integrations/supabase/client';
import { logError } from './error-handler';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role?: string;
  } | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

export interface AuthOptions {
  requireAuth?: boolean;
  requiredRole?: string;
  allowAnonymous?: boolean;
}

// Enhanced JWT token validation with user context
export async function validateAuthToken(token: string): Promise<AuthContext> {
  try {
    if (!token || !token.startsWith('Bearer ')) {
      return {
        user: null,
        isAuthenticated: false,
        hasRole: () => false,
      };
    }

    const jwt = token.replace('Bearer ', '');
    
    // Validate token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    
    if (error || !user) {
      console.warn('Invalid token:', error?.message);
      return {
        user: null,
        isAuthenticated: false,
        hasRole: () => false,
      };
    }

    // Fetch user roles from database
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles = userRoles?.map(r => r.role as string) || ['user'];

    const authContext: AuthContext = {
      user: {
        id: user.id,
        email: user.email || '',
        role: roles[0] || 'user',
      },
      isAuthenticated: true,
      hasRole: (role: string) => roles.includes(role),
    };

    return authContext;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Auth validation failed'));
    return {
      user: null,
      isAuthenticated: false,
      hasRole: () => false,
    };
  }
}

// Middleware wrapper for API endpoints
export function withAuth(options: AuthOptions = {}) {
  return async function authMiddleware(
    request: Request,
    handler: (req: Request, auth: AuthContext) => Promise<Response>
  ): Promise<Response> {
    const { requireAuth = true, requiredRole, allowAnonymous = false } = options;

    try {
      const authHeader = request.headers.get('Authorization');
      const authContext = authHeader 
        ? await validateAuthToken(authHeader)
        : {
            user: null,
            isAuthenticated: false,
            hasRole: () => false,
          };

      // Check authentication requirements
      if (requireAuth && !authContext.isAuthenticated && !allowAnonymous) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check role requirements
      if (requiredRole && !authContext.hasRole(requiredRole)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return await handler(request, authContext);
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Auth middleware error'));
      return new Response(
        JSON.stringify({ error: 'Authentication error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

// Extract user identifier for rate limiting and logging
export function getUserIdentifier(authContext: AuthContext, request: Request): string {
  if (authContext.isAuthenticated && authContext.user) {
    return `user:${authContext.user.id}`;
  }

  // Fallback to IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown';
  return `ip:${ip.split(',')[0].trim()}`;
}

// Check if user is admin
export function isAdmin(authContext: AuthContext): boolean {
  return authContext.hasRole('admin');
}

// Get user context for logging
export function getUserContext(authContext: AuthContext) {
  return {
    userId: authContext.user?.id || null,
    email: authContext.user?.email || null,
    role: authContext.user?.role || null,
    isAuthenticated: authContext.isAuthenticated,
  };
}