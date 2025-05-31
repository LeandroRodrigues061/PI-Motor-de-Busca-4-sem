'use client'
import Template from "@/components/layout/Template";
import { useState, useEffect } from "react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { Imovel } from "@/data/models/Imovel";
import { useFiltro } from "@/context/FilterContext";

export default function Buscador() {
  const [filter, setFilter] = useState<"valor" | "dataLeilao" | "tempoRestante" | null>(null);
  const [filtros, setFiltros] = useState<any>({});
  const [crescente, setCrescente] = useState(false); // começa decrescente para mostrar os mais recentes
  const { imoveis } = useFiltro();

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
        <div className="flex gap-2 items-center">
          <div className="w-1 h-6 bg-primary rounded-lg" />
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