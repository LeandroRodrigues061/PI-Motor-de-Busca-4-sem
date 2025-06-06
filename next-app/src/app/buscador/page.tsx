// src/app/buscador/page.tsx
'use client'
import Template from "@/components/layout/Template";
import { useState, useEffect } from "react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { Imovel } from "@/data/models/Imovel";
import { useFiltro } from "@/context/FilterContext";

// Função auxiliar para parsear datas no formato "DD/MM/YYYY"
// Coloque esta função no escopo do componente ou importe de um arquivo de utilitários
function parsePtBrDate(dateString?: string): Date { // Alterado para retornar Date, incluindo Invalid Date
  if (!dateString) return new Date(NaN); // Retorna Invalid Date se não houver string
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year >= 1000 && year <= 9999 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const date = new Date(Date.UTC(year, month, day));
      // Checagem para garantir que o JS não "corrigiu" a data (ex: 31/02 virando 03/03)
      if (date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day) {
        return date;
      }
    }
  }
  // console.warn(`Data em formato inválido ou não reconhecido para parsePtBrDate: ${dateString}`);
  return new Date(NaN); // Retorna Invalid Date se o parse falhar
}

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

    // Função auxiliar para comparar datas usando parsePtBrDate
    // Assumindo que datasLeiloesA/B são string[] e o primeiro elemento é "DD/MM/YYYY"
    const compararDatas = (datasLeiloesA?: string[], datasLeiloesB?: string[]): number => {
      const stringDataA = datasLeiloesA?.[0];
      const stringDataB = datasLeiloesB?.[0];

      const dateObjA = parsePtBrDate(stringDataA);
      const dateObjB = parsePtBrDate(stringDataB);

      const timeA = dateObjA.getTime(); // getTime() em Invalid Date retorna NaN
      const timeB = dateObjB.getTime();

      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1; // NaNs (ou datas não parseáveis) no final
      if (isNaN(timeB)) return -1;
      
      return timeA - timeB; // Ascendente (datas mais antigas primeiro)
    };

    if (filter === "valor") {
      imoveisParaOrdenar.sort((a, b) => {
        // Assumindo que valor_avaliacao é uma string que representa um número.
        // Se for de fato um número no seu model Imovel, pode simplificar.
        const valorA = parseFloat(a.valor_avaliacao as string);
        const valorB = parseFloat(b.valor_avaliacao as string);

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
    // Removida a lógica para filter === "tempoRestante"
    } else if (filter === null) {
      // Ordenação padrão quando nenhum filtro está ativo
      // Se 'crescente' for false (inicial), ordena por mais recentes primeiro
      if (!crescente) {
        imoveisParaOrdenar.sort((a, b) => compararDatas(b.datas_leiloes, a.datas_leiloes));
      } else {
        // Se 'crescente' for true (caso raro se filter só é null no início)
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