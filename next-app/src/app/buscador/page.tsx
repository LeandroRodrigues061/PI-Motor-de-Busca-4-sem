// src/app/buscador/page.tsx
'use client'
import Template from "@/components/layout/Template";
import { useState, useEffect } from "react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { Imovel } from "@/data/models/Imovel";
import { useFiltro } from "@/context/FilterContext";
import { isDate } from "util/types";

export default function Buscador() {
  // Removido "tempoRestante" do tipo de 'filter'
  const [filter, setFilter] = useState<"valor" | "dataLeilao" | null>(null);
  const [crescente, setCrescente] = useState(false); 
  const { imoveis: fetchedImoveis } = useFiltro();
  const [sortedImoveis, setSortedImoveis] = useState<Imovel[]>([]);

  // Removido "tempoRestante" do tipo do parâmetro 'tipo'
  const handleFiltro = (tipo: "valor" | "dataLeilao" | null) => {
    if (filter === tipo) {
      setCrescente(!crescente);
    } else {
      setFilter(tipo);
      setCrescente(true); 
    }
  };

  useEffect(() => {
    let imoveisParaOrdenar = [...fetchedImoveis];
  
    // Função auxiliar para comparar datas
    const compararDatas = (datasLeiloesA?: Date[], datasLeiloesB?: Date[]): number => {
      const dateObjA = datasLeiloesA?.[0];
      const dateObjB = datasLeiloesB?.[0];
  
      console.log({
        dateObjA,
        dateObjB,
      });
  
      // Verifica se ambos os objetos de data são válidos
      if (dateObjA && dateObjB) {
        return new Date(dateObjA).getTime() - new Date(dateObjB).getTime(); // Ascendente
      }
  
      // Coloca datas inválidas ou ausentes no final
      if (dateObjA) return -1;
      if (dateObjB) return 1;
  
      return 0; // Ambos são inválidos ou ausentes
    };
  
    if (filter === "valor") {
      imoveisParaOrdenar.sort((a, b) => {
        const valorA = a.valor_avaliacao;
        const valorB = b.valor_avaliacao;
  
        let comparacao = 0;
        if (isNaN(valorA) && isNaN(valorB)) comparacao = 0;
        else if (isNaN(valorA)) comparacao = 1; // NaNs no final
        else if (isNaN(valorB)) comparacao = -1; // NaNs no final
        else comparacao = valorA - valorB;
  
        return crescente ? comparacao : comparacao * -1;
      });
    } else if (filter === "dataLeilao") {
      imoveisParaOrdenar.sort((a, b) => {
        return crescente
          ? compararDatas(a.datas_leiloes, b.datas_leiloes) // Ascendente: datas mais antigas primeiro
          : compararDatas(b.datas_leiloes, a.datas_leiloes); // Descendente: datas mais recentes primeiro
      });
    } else if (filter === null) {
      // Ordenação padrão quando nenhum filtro está ativo
      if (!crescente) {
        imoveisParaOrdenar.sort((a, b) => compararDatas(b.datas_leiloes, a.datas_leiloes));
      } else {
        imoveisParaOrdenar.sort((a, b) => compararDatas(a.datas_leiloes, b.datas_leiloes));
      }
    }
  
    setSortedImoveis(imoveisParaOrdenar);
  }, [fetchedImoveis, filter, crescente]);

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
          Foram encontrados <span className="font-semibold">{sortedImoveis.length}</span> imóveis
        </p>

        <div className="flex flex-col gap-6">
          {sortedImoveis.length !== 0 ? (
            sortedImoveis.map((imovel) => (
              <ImovelCard key={imovel._id} imovel={imovel} />
            ))
          ) : (
            <div className="w-full max-w-lg mx-auto flex flex-col py-10 px-4 items-center justify-center gap-4 text-center"> 
              <h3 className="text-2xl md:text-3xl text-zinc-900 font-semibold">Ops! Nenhum resultado encontrado</h3> 
              <p className="text-zinc-600 text-center">
                Não há nenhum imóvel que se encaixa nos filtros aplicados. Pesquise novamente para encontrar seus imóveis.
              </p>
              <Image 
                src={"/img/search-house.png"} 
                alt="imóvel não encontrado" 
                width={300} 
                height={112} 
              />
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}