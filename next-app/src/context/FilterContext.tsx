"use client";
import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";
import { Imovel } from "@/data/models/Imovel";
import estados from "@/data/constants/Estados";

interface Filtros {
  estado: string | null;
  cidade: string | null;
  bairros: string[];
  tipoImovel: string;
  valor: string;
  banco: string[];
}

interface FiltroContextType {
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
  filtrarImoveis: () => Promise<Imovel[]>; // Função para buscar imóveis filtrados
}

const FiltroContext = createContext<FiltroContextType | undefined>(undefined);

export const FiltroProvider = ({ children }: { children: ReactNode }) => {
  const [filtros, setFiltros] = useState<Filtros>({
    estado: estados[0]?.name || null, // Estado padrão
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
        body: JSON.stringify(filtros), // Envia os filtros para a API
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar imóveis");
      }

      const data = await response.json();
      return data; // Retorna os imóveis filtrados
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      return [];
    }
  };

  return (
    <FiltroContext.Provider value={{ filtros, setFiltros, filtrarImoveis }}>
      {children}
    </FiltroContext.Provider>
  );
};

export const useFiltro = () => {
  const context = useContext(FiltroContext);
  if (!context) {
    throw new Error("useFiltro deve ser usado dentro de um FiltroProvider");
  }
  return context;
};