'use client'
import { createContext, useContext, useState } from "react";

type SidebarType = "filter" | "user_config" | null;

interface SidebarContextProps {
  tipo: SidebarType;
  setTipo: (tipo: SidebarType) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [tipo, setTipo] = useState<SidebarType>("filter");

  return (
    <SidebarContext.Provider value={{ tipo, setTipo }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar deve ser usado dentro de SidebarProvider");
  return context;
};
