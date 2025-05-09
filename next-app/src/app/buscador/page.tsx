'use client'
import Template from "@/components/layout/Template";
import { useEffect, useState } from "react";
import { useFiltro } from "@/context/FilterContext";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { useSidebar } from "@/context/SideBarContext";

export default function Buscador() {
  const { filtrarImoveis } = useFiltro();
  const imoveisFiltrados = filtrarImoveis();
  
  // Quando entrar nesta pagina atualiza o contexto da sideBar para renderizar a sideBar correta
  const { setTipo } = useSidebar()
  const setFiltrosSidebar = () => setTipo('filter');
  useEffect(() => {
    setFiltrosSidebar();
  }, []);

  // valor, dataLeilao, tempoRestante — padrão é null (usa dataPublicacao)
  const [filter, setFilter] = useState<"valor" | "dataLeilao" | "tempoRestante" | null>(null);
  const [crescente, setCrescente] = useState(false); // começa decrescente para mostrar os mais recentes

  const handleFiltro = (tipo: typeof filter) => {
    if (filter === tipo) {
      setCrescente(!crescente); // alterna a ordenação
    } else {
      setFilter(tipo);
      setCrescente(true); // novo filtro começa com ordem crescente
    }
  };

  const imoveisOrdenados = [...imoveisFiltrados];

  if (filter === "valor") {
    imoveisOrdenados.sort((a, b) =>
      crescente
        ? a.valorAvaliacao - b.valorAvaliacao
        : b.valorAvaliacao - a.valorAvaliacao
    );
  } else if (filter === "dataLeilao") {
    imoveisOrdenados.sort((a, b) =>
      crescente
        ? new Date(a.dataLeilao).getTime() - new Date(b.dataLeilao).getTime()
        : new Date(b.dataLeilao).getTime() - new Date(a.dataLeilao).getTime()
    );
  } else if (filter === "tempoRestante") {
    imoveisOrdenados.sort((a, b) => {
      const totalA =
        a.tempoRestante.dias * 86400 +
        a.tempoRestante.horas * 3600 +
        a.tempoRestante.minutos * 60 +
        a.tempoRestante.segundos;
      const totalB =
        b.tempoRestante.dias * 86400 +
        b.tempoRestante.horas * 3600 +
        b.tempoRestante.minutos * 60 +
        b.tempoRestante.segundos;
      return crescente ? totalA - totalB : totalB - totalA;
    });
  } else {
    // Ordena por data de publicação (padrão)
    imoveisOrdenados.sort((a, b) =>
      new Date(b.dataLeilao).getTime() - new Date(a.dataLeilao).getTime()
    );
  }

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
          Foram encontrados <span className="font-semibold">{imoveisFiltrados.length}</span> imóveis
        </p>

        <div className="flex flex-col gap-6">
          {imoveisFiltrados.length !== 0 ? (
            imoveisOrdenados.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
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
