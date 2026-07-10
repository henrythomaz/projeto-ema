/**
 * Utilitários de autenticação para a API do EMA.
 * - POST /usuarios → cadastro
 * - POST /login → autenticação (retorna token JWT)
 * Persiste token e usuário no localStorage sob as chaves `ema.token` / `ema.user`.
 */
import { api } from "./api-client";

export type EmaUser = {
  id?: string | number;
  nome: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  usuario?: EmaUser;
  user?: EmaUser;
};

const TOKEN_KEY = "ema.token";
const USER_KEY = "ema.user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): EmaUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmaUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user?: EmaUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export async function signUp(input: { nome: string; email: string; password: string }) {
  return api<{ id?: string | number; mensagem?: string }>("/usuarios", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: { email: string; password: string }) {
  const data = await api<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const user = data.usuario ?? data.user;
  setSession(data.token, user);
  return data;
}

