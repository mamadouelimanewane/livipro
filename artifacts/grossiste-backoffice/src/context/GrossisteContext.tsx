import { createContext, useContext, useState, ReactNode, useCallback } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "") + "/api";

type GrossisteContextType = {
  grossisteId: number;
  setGrossisteId: (id: number) => void;
  token: string | null;
  isAuthenticated: boolean;
  grossisteNom: string;
  login: (grossisteId: number, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  authFetch: (url: string, opts?: RequestInit) => Promise<Response>;
};

const GrossisteContext = createContext<GrossisteContextType | undefined>(undefined);

interface AuthPersisted {
  grossisteId: number;
  token: string;
  grossisteNom: string;
}

function loadPersisted(): AuthPersisted | null {
  try {
    const raw = localStorage.getItem("grossiste_auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function GrossisteProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted();
  const [grossisteId, setGrossisteIdState] = useState<number>(persisted?.grossisteId ?? 1);
  const [token, setToken] = useState<string | null>(persisted?.token ?? null);
  const [grossisteNom, setGrossisteNom] = useState<string>(persisted?.grossisteNom ?? "");

  const setGrossisteId = (id: number) => setGrossisteIdState(id);

  const login = useCallback(async (gId: number, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API}/auth/grossiste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grossisteId: gId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Code incorrect" };
      }
      setGrossisteIdState(gId);
      setToken(data.token);
      setGrossisteNom(data.grossiste?.nom ?? "");
      localStorage.setItem("grossiste_auth", JSON.stringify({
        grossisteId: gId,
        token: data.token,
        grossisteNom: data.grossiste?.nom ?? "",
      }));
      return { success: true };
    } catch {
      return { success: false, error: "Erreur de connexion réseau" };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setGrossisteNom("");
    localStorage.removeItem("grossiste_auth");
  }, []);

  const authFetch = useCallback((url: string, opts: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(opts.headers as Record<string, string> || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...opts, headers });
  }, [token]);

  return (
    <GrossisteContext.Provider value={{
      grossisteId,
      setGrossisteId,
      token,
      isAuthenticated: !!token,
      grossisteNom,
      login,
      logout,
      authFetch,
    }}>
      {children}
    </GrossisteContext.Provider>
  );
}

export function useGrossiste() {
  const context = useContext(GrossisteContext);
  if (!context) throw new Error("useGrossiste must be used within GrossisteProvider");
  return context;
}
