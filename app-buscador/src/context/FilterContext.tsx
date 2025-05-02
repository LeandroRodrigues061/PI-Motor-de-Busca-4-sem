"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import Estado from "@/data/models/Estado";
import { imoveis } from "@/data/constants/Imoveis";
import { Imovel } from "@/data/models/Imovel";
interface Filtros {
  estado: Estado | null;
  cidade: string | null;
  bairros: string[];
  tipoImovel: string;
  valor: string;
}

// aqui ficam as funções e variaveis exportadas do contexto
interface FiltroContextType {
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
  filtrarImoveis: () => Imovel[];
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

  const filtrarImoveis = (): Imovel[] => {
    return imoveis.filter((imovel) => {
      // Filtro por estado
      if (filtros.estado && imovel.estado !== filtros.estado.name) {
        return false;
      }

      // Filtro por cidade
      if (filtros.cidade && imovel.cidade !== filtros.cidade) {
        return false;
      }

      // Filtro por bairros, se algum bairro for selecionado
      if (filtros.bairros.length > 0 && !filtros.bairros.includes(imovel.bairro)) {
        return false;
      }

      // Filtro por tipo de imóvel (se diferente de "indiferente")
      if (
        filtros.tipoImovel.toLowerCase() !== "indiferente" &&
        imovel.tipoImovel.toLowerCase() !== filtros.tipoImovel.toLowerCase()
      ) {
        return false;
      }

      // Filtro por valor máximo (se definido)
      if (filtros.valor) {
        const valorMaximo = Number(filtros.valor);
        if (!isNaN(valorMaximo) && imovel.valorAvaliacao > valorMaximo) {
          return false;
        }
      }

      return true;
    });
  };
  

  return (
    <FiltroContext.Provider value={{ filtros, setFiltros,  filtrarImoveis }}>
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