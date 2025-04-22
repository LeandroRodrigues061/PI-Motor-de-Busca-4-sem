'use client'
import { createContext, useContext, useState, ReactNode } from "react";
import { Imovel } from "@/data/models/Imovel";
import { imoveis as todosImoveis } from "@/data/constants/Imoveis";

interface Filtros {
  estado: any;
  cidade: string | null;
  bairros: string[];
  tipoImovel: string;
  valor: string;
}

interface ImoveisContextProps {
  imoveisFiltrados: Imovel[];
  buscarImoveis: (filtros: Filtros) => void;
}

const ImoveisContext = createContext<ImoveisContextProps | undefined>(undefined);

export const useImoveis = () => {
  const context = useContext(ImoveisContext);
  if (!context) {
    throw new Error("useImoveis deve ser usado dentro de ImoveisProvider");
  }
  return context;
};

export const ImoveisProvider = ({ children }: { children: ReactNode }) => {
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);

  const buscarImoveis = (filtros: Filtros) => {
    let resultado = [...todosImoveis];

    resultado = resultado.filter((imovel) => {
      const valor = imovel.valorAvaliacao;
      switch (filtros.valor) {
        case ">100000":
          return valor <= 100000;
        case "100001-200000":
          return valor > 100000 && valor <= 200000;
        case "200002-400000":
          return valor > 200000 && valor <= 400000;
        case "400001-750000":
          return valor > 400000 && valor <= 750000;
        case "> 750000":
          return valor > 750000;
        default:
          return true;
      }
    });

    setImoveisFiltrados(resultado);
  };

  return (
    <ImoveisContext.Provider value={{ imoveisFiltrados, buscarImoveis }}>
      {children}
    </ImoveisContext.Provider>
  );
};
