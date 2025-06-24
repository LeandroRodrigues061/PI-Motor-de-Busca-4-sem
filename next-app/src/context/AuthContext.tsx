"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import {jwtDecode} from 'jwt-decode';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation';

type UserPayload = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
};

type AuthContextType = {
  user: UserPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  favorites: string[]; // IDs dos imóveis favoritos
  addFavorite: (imovelId: string) => Promise<void>;
  removeFavorite: (imovelId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies['auth.token'];

    if (token) {
      try {
        const decodedUser: UserPayload = jwtDecode(token);
        setUser(decodedUser);
        fetchFavorites(decodedUser.id);
      } catch (error) {
        console.error("Token inválido ou expirado, limpando...", error);
        destroyCookie(null, 'auth.token', { path: '/' });
      }
    }
    setIsLoading(false);
  }, []);

  const fetchFavorites = async (userId: string) => {
    try {
      const token = parseCookies()['auth.token']; 
  
      if (!token) {
        throw new Error("Token não encontrado nos cookies.");
      }
  
      const res = await fetch(`/api/favoritos/buscarFavoritos?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho Authorization
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        const favoritosString = data.favoritos.map((idObj: any) => {
          if (idObj.toHexString) {
            return idObj.toHexString();
          }
          if (idObj._id) {
            return idObj._id.toString();
          }
          return idObj.toString();
        });
        setFavorites(favoritosString);
        console.log(favoritosString, "Favoritos atualizados com sucesso!");
      } else {
        const errorData = await res.json();
        console.error("Erro ao buscar favoritos:", errorData.message);
      }
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    }
  };

  const signIn = (token: string) => {
    try {
      const decodedUser: UserPayload = jwtDecode(token);
      setCookie(null, 'auth.token', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      setUser(decodedUser);
      fetchFavorites(decodedUser.id);
      router.push('/buscador');
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
    }
  };

  const signOut = () => {
    destroyCookie(null, 'auth.token', { path: '/' });
    setUser(null);
    setFavorites([]);
    router.push('/login');
  };

  const addFavorite = async (imovelId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/favoritos/adicionar', {
        method: 'POST',
        headers: 
        { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${parseCookies()['auth.token']}`
        },
        body: JSON.stringify({ imovelId, userId: user.id }),
      });
      if (res.ok) {
        await fetchFavorites(user.id);
      } else {
        const errorData = await res.json();
        console.error("Erro ao adicionar favorito:", errorData.message);
      }
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
    }
  };
  
  const removeFavorite = async (imovelId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/favoritos/remover', {
        method: 'POST',
        headers: 
        { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${parseCookies()['auth.token']}`
        },
        body: JSON.stringify({ imovelId, userId: user.id }),
      });
      if (res.ok) {
        await fetchFavorites(user.id);
      } else {
        const errorData = await res.json();
        console.error("Erro ao remover favorito:", errorData.message);
      }
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
      favorites,
      addFavorite,
      removeFavorite,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};