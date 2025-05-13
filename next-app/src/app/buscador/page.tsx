'use client'
import Template from "@/components/layout/Template";
import { useState, useEffect } from "react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { Imovel } from "@/data/models/Imovel";

export default function Buscador() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filter, setFilter] = useState<"valor" | "dataLeilao" | "tempoRestante" | null>(null);
  const [crescente, setCrescente] = useState(false); // começa decrescente para mostrar os mais recentes

  // Função para buscar os imóveis da API
  const fetchImoveis = async () => {
    try {
      const response = await fetch("/api/imoveis"); // Substitua pelo endpoint correto
      const data = await response.json();
      console.log("dados adicionados")
      setImoveis(data);
      console.log(setImoveis) // Armazena os dados no estado
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
    }
  };

  // useEffect para buscar os imóveis ao carregar a página
  useEffect(() => {
    fetchImoveis();
  }, []);

  const handleFiltro = (tipo: typeof filter) => {
    if (filter === tipo) {
      setCrescente(!crescente); // alterna a ordenação
    } else {
      setFilter(tipo);
      setCrescente(true); // novo filtro começa com ordem crescente
    }
  };

  return (
    <Template>
      <section className="flex flex-col p-8 gap-4">
        <div className="flex gap-1 items-center">
          <div className="w-1 h-6 bg-primary" />
          <h1 className="text-3xl font-semibold text-zinc-900">Buscador</h1>
        </div>

        <SubFiltros 
          crescente={crescente} 
          filter={filter} 
          handleFiltro={handleFiltro} 
        />

        <div className="w-full h-[0.5px] bg-zinc-300 rounded-2xl my-2" />
        <p className="text-zinc-500">
          Foram encontrados <span className="font-semibold">{imoveis.length}</span> imóveis
        </p>

        <div className="flex flex-col gap-6">
          {imoveis.length !== 0 ? (
            imoveis.map((imovel) => (
              <ImovelCard key={imovel._id} imovel={imovel} />
            ))
          ) : (
            <div className="w-[900px] flex flex-col py-2 px-20 items-center justify-center gap-4">
              <h3 className="text-3xl text-zinc-900 font-semibold">Ops! Nenhum resultado encontrado</h3>
              <p className="text-zinc-600 text-center">
                Não há nenhum imóvel que se encaixa nos filtros aplicados. Pesquise novamente para encontrar seus imóveis.
              </p>
              <Image src={"/img/search-house.png"} alt="imóvel não encontrado" width={400} height={150} />
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}