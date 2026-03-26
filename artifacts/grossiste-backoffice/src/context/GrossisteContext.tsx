import { createContext, useContext, useState, ReactNode } from "react";

type GrossisteContextType = {
  grossisteId: number;
  setGrossisteId: (id: number) => void;
};

const GrossisteContext = createContext<GrossisteContextType | undefined>(undefined);

export function GrossisteProvider({ children }: { children: ReactNode }) {
  const [grossisteId, setGrossisteId] = useState(1);
  return (
    <GrossisteContext.Provider value={{ grossisteId, setGrossisteId }}>
      {children}
    </GrossisteContext.Provider>
  );
}

export function useGrossiste() {
  const context = useContext(GrossisteContext);
  if (!context) throw new Error("useGrossiste must be used within GrossisteProvider");
  return context;
}
