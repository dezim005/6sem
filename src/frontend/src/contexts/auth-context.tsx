
"use client";

import type { User } from "@/types";
import { useRouter } from "next/navigation";
import type { Dispatch, ReactNode, SetStateAction} from "react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (data: Pick<User, "email" | "password">) => Promise<boolean>;
  logout: () => void;
  register: (data: Pick<User, "name" | "email" | "password"> & { condominiumId?: string }) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setUser: Dispatch<SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STATE_KEY = "vagaLivreAuth";
const API_BASE =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway-api-d2uo.onrender.com";
const WAKE_RETRY_ATTEMPTS = 8;
const WAKE_RETRY_DELAY_MS = 8000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStoredSession(): { user: User; token: string } | null {
  try {
    const storedAuth = localStorage.getItem(AUTH_STATE_KEY);
    if (!storedAuth) {
      return null;
    }
    const authData = JSON.parse(storedAuth);
    if (authData?.token && authData?.user) {
      return { user: authData.user, token: authData.token };
    }
  } catch (error) {
    console.error("Falha ao carregar o estado de autenticação do localStorage", error);
    localStorage.removeItem(AUTH_STATE_KEY);
  }
  return null;
}

function saveSession(user: User, token?: string) {
  const current = readStoredSession();
  localStorage.setItem(
    AUTH_STATE_KEY,
    JSON.stringify({
      isAuthenticated: true,
      user,
      token: token || current?.token,
    })
  );
}

async function authRequest(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: any }> {
  let lastError: unknown;
  for (let attempt = 0; attempt < WAKE_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok || (response.status !== 502 && response.status !== 503)) {
        return { ok: response.ok, status: response.status, body };
      }
      lastError = new Error(body?.message || `HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < WAKE_RETRY_ATTEMPTS - 1) {
      await wait(WAKE_RETRY_DELAY_MS);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Erro ao autenticar.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const stored = readStoredSession();
      if (!stored) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { ok, body } = await authRequest("/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${stored.token}` },
        });
        if (!ok || !body?.data) {
          localStorage.removeItem(AUTH_STATE_KEY);
          if (!cancelled) {
            setIsAuthenticated(false);
            setUser(null);
          }
          return;
        }
        if (!cancelled) {
          setIsAuthenticated(true);
          setUser(body.data);
          saveSession(body.data, stored.token);
        }
      } catch (error) {
        console.error("Falha ao validar a sessão", error);
        if (!cancelled) {
          setIsAuthenticated(true);
          setUser(stored.user);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (data: Pick<User, "email" | "password">): Promise<boolean> => {
    try {
      const { ok, status, body } = await authRequest("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!ok || !body?.data?.token || !body?.data?.user) {
        const description = body?.message || (status === 401 ? "Email ou senha inválidos." : "Erro ao autenticar.");
        toast({
          title: status === 403 ? "Acesso não permitido" : "Falha no Login",
          description,
          variant: "destructive",
        });
        return false;
      }

      setIsAuthenticated(true);
      setUser(body.data.user);
      try {
        saveSession(body.data.user, body.data.token);
      } catch (error) {
        console.error("Falha ao salvar o estado de autenticação no localStorage", error);
      }
      router.push("/");
      return true;
    } catch (error) {
      console.error("Falha ao autenticar", error);
      toast({
        title: "Falha no Login",
        description: "Erro ao autenticar.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (data: Pick<User, "name" | "email" | "password"> & { condominiumId?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          condominiumId: data.condominiumId || undefined,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, message: body.message || "Erro ao cadastrar usuário." };
      }
      return { success: true, message: body.message || "Cadastro realizado com sucesso!" };
    } catch (error) {
      console.error("Falha ao cadastrar usuário", error);
      return { success: false, message: "Erro ao cadastrar usuário." };
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "Usuário não autenticado." };
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body?.data) {
        return { success: false, message: body.message || "Erro ao salvar perfil. Tente novamente." };
      }

      const updatedUser = { ...user, ...body.data };
      setUser(updatedUser);
      try {
        saveSession(updatedUser);
      } catch (error) {
        console.error("Falha ao salvar o estado de autenticação atualizado no localStorage", error);
      }
      return { success: true, message: body.message || "Perfil atualizado com sucesso!" };
    } catch (error) {
      console.error("Falha ao atualizar perfil", error);
      return { success: false, message: "Erro ao salvar perfil. Tente novamente." };
    }
  };


  const logout = () => {
    const stored = readStoredSession();
    if (stored?.token) {
      authRequest("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${stored.token}` },
      }).catch((error) => {
        console.error("Falha ao encerrar a sessão na API", error);
      });
    }
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STATE_KEY);
    } catch (error) {
      console.error("Falha ao remover o estado de autenticação do localStorage", error);
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, register, updateUserProfile, setIsAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
