"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import Estado from "@/data/models/Estado";

interface Filtros {
  estado: Estado | null;
  cidade: string | null;
  bairros: string[];
  tipoImovel: string;
  valor: string;
}

interface FiltroContextType {
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
}

const FiltroContext = createContext<FiltroContextType | undefined>(undefined);

export const FiltroProvider = ({ children }: { children: ReactNode }) => {
  const [filtros, setFiltros] = useState<Filtros>({
    estado: null,
    cidade: null,
    bairros: [],
    tipoImovel: "indiferente",
    valor: "",
  });

  return (
    <FiltroContext.Provider value={{ filtros, setFiltros }}>
      {children}
    </FiltroContext.Provider>
  );
};

export const useFiltro = (): FiltroContextType => {
  const context = useContext(FiltroContext);
  if (!context) {
    throw new Error("useFiltro deve ser usado dentro de um FiltroProvider");
  }
  return context;
};