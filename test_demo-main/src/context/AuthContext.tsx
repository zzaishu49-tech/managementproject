import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced mock users with Indian names
const MOCK_USERS: User[] = [
  { id: '1', name: 'Arjun Singh', email: 'manager@xeetrack.com', role: 'manager' },
  { id: '2', name: 'Rakesh Gupta', email: 'employee@xeetrack.com', role: 'employee' },
  { id: '3', name: 'Priya Sharma', email: 'client@xeetrack.com', role: 'client' },
  { id: '4', name: 'Meera Iyer', email: 'meera@xeetrack.com', role: 'employee' },
  { id: '5', name: 'Rajesh Kumar', email: 'rajesh@xeetrack.com', role: 'client' }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('xeetrack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('xeetrack_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('xeetrack_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}