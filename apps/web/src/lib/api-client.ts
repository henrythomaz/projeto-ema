/**
 * Cliente HTTP central para a API do EMA.
 * Lê VITE_BACK_URL do .env e injeta o header do ngrok
 * para evitar a página intersticial de aviso.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_BACK_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:3000";

type ApiOptions = RequestInit & {
  /** Se true, injeta o header Authorization com o token em localStorage. */
  auth?: boolean;
  /** Se true, injeta x-api-key da estação. */
  apiKey?: string;
};

export async function api<T = unknown>(
  path: string,
  { auth, apiKey, headers, ...init }: ApiOptions = {},
): Promise<T> {
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    // Necessário para pular a página de aviso do ngrok em domínios .ngrok-free.dev
    "ngrok-skip-browser-warning": "true",
    ...(headers as Record<string, string> | undefined),
  };

  if (init.body && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth && typeof window !== "undefined") {
    const token = window.localStorage.getItem("ema.token");
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (apiKey) finalHeaders["x-api-key"] = apiKey;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const data = (await res.json()) as { mensagem?: string; message?: string };
      message = data.mensagem ?? data.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

