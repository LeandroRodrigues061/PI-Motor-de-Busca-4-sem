'use client'
import Template from "@/components/layout/Template";
import { useState, useEffect } from "react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { Imovel } from "@/data/models/Imovel"; // Assuming Imovel has _id, valor, and dataLeilao: string[]
import { useFiltro } from "@/context/FilterContext";

export default function Buscador() {
  const [filter, setFilter] = useState<"valor" | "dataLeilao" | "tempoRestante" | null>(null);
  // const [filtros, setFiltros] = useState<any>({}); // Kept as it was in your code
  const [crescente, setCrescente] = useState(false); 
  const { imoveis: fetchedImoveis } = useFiltro();
  const [sortedImoveis, setSortedImoveis] = useState<Imovel[]>([]);


  const handleFiltro = (tipo: typeof filter) => {
    if (filter === tipo) {
      setCrescente(!crescente);
    } else {
      setFilter(tipo);
      setCrescente(true); 
    }
  };

  useEffect(() => {
    let imoveisParaOrdenar = [...fetchedImoveis];

    // Helper function to compare dates
    // Now handles dataLeilao being string | Date | string[]
    // If string[], it uses the first element.
    const compararDatas = (dateInputA: string | Date | string[], dateInputB: string | Date | string[]): number => {
      let dateStrToParseA: string | undefined;
      let dateStrToParseB: string | undefined;

      // Process dateInputA
      if (Array.isArray(dateInputA)) {
        // If it's an array, use the first element if available
        dateStrToParseA = dateInputA.length > 0 ? dateInputA[0] : undefined;
      } else if (dateInputA instanceof Date) {
        dateStrToParseA = dateInputA.toISOString(); // Convert Date object to ISO string
      } else {
        dateStrToParseA = dateInputA; // Assumed to be a string
      }

      // Process dateInputB
      if (Array.isArray(dateInputB)) {
        dateStrToParseB = dateInputB.length > 0 ? dateInputB[0] : undefined;
      } else if (dateInputB instanceof Date) {
        dateStrToParseB = dateInputB.toISOString();
      } else {
        dateStrToParseB = dateInputB;
      }

      // Handle cases where a date string might be undefined (e.g., empty array or originally undefined)
      if (dateStrToParseA === undefined && dateStrToParseB === undefined) return 0; // Both invalid/missing, treat as equal
      if (dateStrToParseA === undefined) return 1; // A is invalid/missing, sort it after B
      if (dateStrToParseB === undefined) return -1; // B is invalid/missing, sort it after A

      const dataA = new Date(dateStrToParseA).getTime();
      const dataB = new Date(dateStrToParseB).getTime();

      // Handle invalid date strings after parsing
      if (isNaN(dataA) && isNaN(dataB)) return 0; // Both parsed to NaN
      if (isNaN(dataA)) return 1; // dataA is NaN, comes after valid dataB
      if (isNaN(dataB)) return -1; // dataB is NaN, comes after valid dataA
      
      return dataA - dataB; // Ascending order (earlier dates first)
    };

    if (filter === "valor") {
      imoveisParaOrdenar.sort((a, b) => {
        const valorA = typeof a.valor_avaliacao === 'number' ? a.valor_avaliacao : 0;
        const valorB = typeof b.valor_avaliacao === 'number' ? b.valor_avaliacao : 0;
        return crescente ? valorA - valorB : valorB - valorA;
      });
    } else if (filter === "dataLeilao") {
      imoveisParaOrdenar.sort((a, b) => {
        // a.dataLeilao and b.dataLeilao are expected to be string[] as per the error
        return crescente 
          ? compararDatas(a.datas_leiloes, b.datas_leiloes) // Ascending: mais distantes (older/earlier dates first)
          : compararDatas(b.datas_leiloes, a.datas_leiloes); // Descending: mais recentes (newer/later dates first)
      });
    } else if (filter === "tempoRestante") {
      // TODO: Implement sorting logic for 'tempoRestante'
    } else if (filter === null) {
      // Default sort: most recent auction dates first (since crescente is initially false)
      if (!crescente) {
        imoveisParaOrdenar.sort((a, b) => compararDatas(b.datas_leiloes, a.datas_leiloes));
      } else {
        // If crescente becomes true with no filter, sort by oldest auction date
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
            <div className="w-[900px] flex flex-col py-2 px-20 items-center justify-center gap-4">
              <h3 className="text-3xl text-zinc-900 font-semibold">Ops! Nenhum resultado encontrado</h3>
              <p className="text-zinc-600 text-center">
                Não há nenhum imóvel que se encaixa nos filtros aplicados. Pesquise novamente para encontrar seus imóveis.
              </p>
              <Image src={"/img/search-house.png" || null} alt="imóvel não encontrado" width={400} height={150} />
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}