"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { ReactNode } from "react";
import { Imovel } from "@/data/models/Imovel";
import estados from "@/data/constants/Estados";

interface Filtros {
  estado: string | null;
  cidade: string | null;
  bairro: string[] | null;
  tipoImovel: string | null;
  valor: string | null;
  banco: string[] | null;
}

interface FiltroContextType {
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
  buscarComFiltros: (novosFiltros: Filtros) => Promise<void>;
  imoveis: Imovel[];
}

const FiltroContext = createContext<FiltroContextType | undefined>(undefined);

export const FiltroProvider = ({ children }: { children: ReactNode }) => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    estado: estados[0]?.name || null, // Estado padrão
    cidade: null,
    bairro: [],
    tipoImovel: "indiferente",
    valor: "",
    banco: [],
    
  });

  const buscarComFiltros = async (novosFiltros: Filtros) => {
    setFiltros(novosFiltros);
    // Aguarde o estado ser atualizado antes de buscar
    const encontrados = await filtrarImoveisComFiltros(novosFiltros);
    setImoveis(encontrados);
  };

  const imoveisSemFiltro = async () =>{
    const response = await imoveisSemFiltroApi();
    setImoveis(response);
  }

  // Função para buscar imóveis sem filtros do backend
  const imoveisSemFiltroApi = async () =>{
    try {
      const response = await fetch("/api/imoveis", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar imóveis");
      }
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      return [];
    }
  }
  
  // Função para buscar imóveis filtrados do backend
  const filtrarImoveisComFiltros = async (filtrosParaBuscar: Filtros): Promise<Imovel[]> => {
    try {
      const response = await fetch("/api/imoveisfiltrados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtrosParaBuscar),
      });
      if (!response.ok) throw new Error("Erro ao buscar imóveis");
      const data = await response.json();
      console.log("Recebido da API:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      return [];
    }
  };

  useEffect(() => {
    imoveisSemFiltro();
  }, []);

  return (
    <FiltroContext.Provider value={{ filtros, setFiltros, buscarComFiltros, imoveis }}>
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