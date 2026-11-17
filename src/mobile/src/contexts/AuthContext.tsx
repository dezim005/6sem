import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restaura sessão salva no AsyncStorage ao inicializar o app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@vagalivre_token');
        const storedUser = await AsyncStorage.getItem('@vagalivre_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validação em segundo plano no endpoint /auth/me
          try {
            const response = await api.get('/api/v1/auth/me');
            setUser(response.data);
            await AsyncStorage.setItem('@vagalivre_user', JSON.stringify(response.data));
          } catch (err) {
            console.warn('Sessão expirada ou falha ao validar /auth/me');
            await signOut();
          }
        }
      } catch (error) {
        console.error('Falha ao restaurar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    setIsLoading(true);
    try {
      console.log('Disparando login para:', `${api.defaults.baseURL}/api/v1/auth/login`);
      
      const response = await api.post('/api/v1/auth/login', { 
        email: email.trim(), 
        password 
      });

      console.log('Resposta do Login:', response.data);

      // O backend retorna dentro de response.data.data
      const payload = response.data?.data || response.data;
      const receivedToken = payload?.token || payload?.accessToken;
      const receivedUser = payload?.user || {
        id: payload?.id || payload?.userId || 'user-default',
        name: payload?.name || 'Usuário',
        email: email.trim(),
        role: payload?.role || 'resident',
        status: payload?.status || 'approved',
        condominiumId: payload?.condominiumId || ''
      };

      if (!receivedToken) {
        throw new Error('O backend não retornou um token válido.');
      }

      setToken(receivedToken);
      setUser(receivedUser);

      await AsyncStorage.setItem('@vagalivre_token', receivedToken);
      await AsyncStorage.setItem('@vagalivre_user', JSON.stringify(receivedUser));
      console.log('Login efetuado com sucesso! Usuário logado:', receivedUser.name);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(userData: any) {
    setIsLoading(true);
    try {
      // Dispara o cadastro para o endpoint de usuários
      const response = await api.post('/api/v1/users', userData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('@vagalivre_token');
    await AsyncStorage.removeItem('@vagalivre_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}