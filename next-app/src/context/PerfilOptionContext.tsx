'use client'
import { createContext, ReactNode, useContext, useState } from "react";

interface OptionContextType {
  option: string;
  setOption: (option: string) => void;
}
const PerfilOptionContext = createContext<OptionContextType | undefined>(undefined);

export const PerfilOptionProvider = ({ children }: { children: ReactNode }) => {
  const [option, setOption] = useState("config");

  return (
    <PerfilOptionContext.Provider value={{ option, setOption }}>
      {children}
    </PerfilOptionContext.Provider>
  );
}

export const usePerfilOption = () => {
   const context = useContext(PerfilOptionContext);
   if (!context) throw new Error("useSidebar deve ser usado dentro de SidebarProvider");
  return context;
}
