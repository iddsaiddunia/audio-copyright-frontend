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
        // In a real app, you would verify the token with your backend
        const storedUser = localStorage.getItem('cosotaUser');
        
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('cosotaUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate a successful login with mock data
      
      // IMPORTANT: In production, this should be replaced with a real API call
      // that returns a JWT token and user data after server-side verification
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user based on email (for demonstration only)
      let mockUser: User;
      
      if (email.includes('admin')) {
        mockUser = {
          id: '1',
          name: 'Admin User',
          email,
          roles: ['technicalAdmin', 'contentAdmin']
        };
      } else if (email.includes('finance')) {
        mockUser = {
          id: '2',
          name: 'Finance Manager',
          email,
          roles: ['financialAdmin']
        };
      } else if (email.includes('content')) {
        mockUser = {
          id: '3',
          name: 'Content Manager',
          email,
          roles: ['contentAdmin']
        };
      } else {
        mockUser = {
          id: '4',
          name: 'Artist User',
          email,
          roles: ['artist']
        };
      }
      
      // Store user in localStorage (in production, store JWT token instead)
      localStorage.setItem('cosotaUser', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      
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
      // In a real app, you might need to invalidate the token on the server
      localStorage.removeItem('cosotaUser');
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
