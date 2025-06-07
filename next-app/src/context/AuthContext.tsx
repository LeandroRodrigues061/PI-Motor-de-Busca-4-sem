"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation'; 

// Tipagem do payload do seu JWT
type UserPayload = {
  id: string;
  nome: string;
  email: string;
};

// Tipagem do valor do Contexto
type AuthContextType = {
  user: UserPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

// Criando o Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Criando o Provider
type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // Agora isso vai funcionar corretamente

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies['auth.token'];

    if (token) {
      try {
        const decodedUser: UserPayload = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Token inválido ou expirado, limpando...", error);
        destroyCookie(null, 'auth.token', { path: '/' });
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (token: string) => {
    try {
      const decodedUser: UserPayload = jwtDecode(token);
      
      setCookie(null, 'auth.token', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      setUser(decodedUser);
      router.push('/buscador'); 
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
    }
  };

  const signOut = () => {
    destroyCookie(null, 'auth.token', { path: '/' });
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};