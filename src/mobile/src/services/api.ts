import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://gateway-api-d2uo.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Tolerância para cold start no Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Anexa o Bearer Token do AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@vagalivre_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar token do AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta: Tratamento de expiração de token (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@vagalivre_token');
      await AsyncStorage.removeItem('@vagalivre_user');
    }
    return Promise.reject(error);
  }
);

export default api;