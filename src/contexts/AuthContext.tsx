import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';
import { hasPermission, hasRole, isAdmin } from '../utils/permissions';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  hasPermission: (action: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        let user = null;
        if (token) {
          try {
            const { jwtDecode } = await import('jwt-decode');
            const decoded: any = jwtDecode(token);
            const storedUser = localStorage.getItem('cosotaUser');
            let role = decoded.role;
            let adminType = decoded.adminType && decoded.adminType !== 'null' && decoded.adminType !== null ? decoded.adminType : undefined;
            if (storedUser) {
              const parsed = JSON.parse(storedUser);
              role = parsed.role || role;
              adminType = parsed.adminType || adminType;
              // PATCH: If adminType is missing but roles array exists, extract adminType
              if (role === 'admin' && !adminType && Array.isArray(parsed.roles)) {
                const possibleTypes = ['content', 'financial', 'technical', 'super'];
                adminType = parsed.roles.find((r: string) => possibleTypes.includes(r));
              }
              user = { ...parsed, id: decoded.id, role, adminType };
            } else {
              // PATCH: If adminType is missing but decoded.roles exists, extract adminType
              if (role === 'admin' && !adminType && Array.isArray(decoded.roles)) {
                const possibleTypes = ['content', 'financial', 'technical', 'super'];
                adminType = decoded.roles.find((r: string) => possibleTypes.includes(r));
              }
              user = { id: decoded.id, role, adminType, email: decoded.email || '', name: decoded.name || '' };
            }
            // Debug log
            console.debug('[AuthContext] Set currentUser:', user);
            setCurrentUser(user);
          } catch (e) {
            // Invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('cosotaUser');
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('cosotaUser');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const api = new (await import('../services/apiService')).ApiService({ getToken: () => null });
      const data = await api.login({ email, password });
      // Store JWT token
      localStorage.setItem('token', data.token);
      // Decode JWT for id, role, adminType
      const { jwtDecode } = await import('jwt-decode');
      const decoded: any = jwtDecode(data.token);
      // Always produce a User object with correct role/adminType
      let role = decoded.role;
      let adminType = decoded.adminType && decoded.adminType !== 'null' && decoded.adminType !== null ? decoded.adminType : undefined;
      // PATCH: If adminType is missing but roles array exists, extract adminType
      if (role === 'admin' && !adminType && Array.isArray(data.user.roles)) {
        const possibleTypes = ['content', 'financial', 'technical', 'super'];
        adminType = data.user.roles.find((r: string) => possibleTypes.includes(r));
      }
      const user = { ...data.user, id: decoded.id, role, adminType };
      // Store user object for UI (no roles array, only role/adminType)
      localStorage.setItem('cosotaUser', JSON.stringify(user));
      // Optionally store user_role for legacy code
      localStorage.setItem('user_role', decoded.role);
      // Debug log
      console.debug('[AuthContext] Login set currentUser:', user);
      setCurrentUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Get the token for the API call
      const token = localStorage.getItem('token');
      
      // Call the backend logout endpoint
      if (token) {
        try {
          const api = new (await import('../services/apiService')).ApiService({ getToken: () => token });
          await api.logout();
          console.debug('[AuthContext] Logout API call successful');
        } catch (apiError) {
          // Continue with client-side logout even if API call fails
          console.error('Logout API call failed:', apiError);
        }
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('cosotaUser');
      localStorage.removeItem('user_role');
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  // Permission checking functions
  const checkPermission = (action: string) => hasPermission(currentUser, action);
  const checkRole = (role: string) => hasRole(currentUser, role as any);
  const checkIsAdmin = () => isAdmin(currentUser);

  const value = {
    currentUser,
    isLoading,
    hasPermission: checkPermission,
    hasRole: checkRole,
    isAdmin: checkIsAdmin,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
