"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Imovel } from "@/data/models/Imovel";

interface Filtros {
  estado: string | null;
  cidade: string | null;
  bairros: string[];
  tipoImovel: string;
  valor: string;
  banco: string[];
}

// aqui ficam as funções e variáveis exportadas do contexto
interface FiltroContextType {
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
  filtrarImoveis: () => Promise<Imovel[]>; // Agora é uma função assíncrona
}

const FiltroContext = createContext<FiltroContextType | undefined>(undefined);

export const FiltroProvider = ({ children }: { children: ReactNode }) => {
  const [filtros, setFiltros] = useState<Filtros>({
    estado: null,
    cidade: null,
    bairros: [],
    tipoImovel: "indiferente",
    valor: "",
    banco: [],
  });

  // Função para buscar imóveis filtrados do backend
  const filtrarImoveis = async (): Promise<Imovel[]> => {
    try {
      const response = await fetch("/api/imoveisfiltrados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtros), // Envia os filtros para o backend
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar imóveis do banco");
      }

      const data: Imovel[] = await response.json();
      return data; // Retorna os imóveis filtrados
    } catch (error) {
      console.error("Erro ao filtrar imóveis:", error);
      return [];
    }
  };

  return (
    <FiltroContext.Provider value={{ filtros, setFiltros, filtrarImoveis }}>
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