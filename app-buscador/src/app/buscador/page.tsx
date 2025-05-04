 'use client'
import Template from "@/components/layout/Template";
import { useState } from "react";
import { IconArrowDown, IconArrowUp, IconClock, IconHeart } from "@tabler/icons-react";
import { useFiltro } from "@/context/FilterContext";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";


export default function Buscador(){

  /* Este contexto esta sendo usado para renderizar os elementos com base nas contants
     Como imoveisFiltrados sera substituidos pela lógica do backend com imoveis JA FILTRADOS pelo mongo
     so substituir no componente <Imovel>
  */
  const { filtrarImoveis } = useFiltro();
  const imoveisFiltrados = filtrarImoveis(); // Variavel que guarda os valores de objetos filtrados

  const [filter, setFilter] = useState(1);

  const filter1 = () => {
    setFilter(1)
  }
  const filter2 = () => {
    setFilter(2)
  }
  const filter3 = () => {
    setFilter(3)
  }
  const filter4 = () => {
    setFilter(4)
  }

  const [crescente, setCrescente] = useState(true);
  const toggleCrescente = () => {
    setCrescente(!crescente)
  }
  // const [isFavorite, setIsFavorite ] = useState(false);
  // const toggleFavorite = () => {
  //   setIsFavorite(!isFavorite)
  // }
  return(
      <Template>
        <section className="flex flex-col p-8 gap-4">
          <div className="flex gap-1 items-center">
            <div className="w-1 h-6 bg-primary"/>
            <h1 className="text-3xl font-semibold text-zinc-900">Buscador</h1>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={filter1} className={`px-8 py-2  hover:text-primary font-semibold transition-all durantion-300  border rounded-xl cursor-pointer ${filter === 1 ? "border-primary text-primary" : " border-zinc-300 text-zinc-500"} `}>
              <p>Recentes</p>
            </button>
            <button onClick={() => {filter2(), toggleCrescente()}} className={`px-8 py-2  hover:text-primary font-semibold transition-all durantion-300  border rounded-xl cursor-pointer flex gap-1 justify-center items-center ${filter === 2 ? "border-primary text-primary" : " border-zinc-300 text-zinc-500"} `}>
              <p>Valores</p>
              {
                crescente ? <IconArrowUp/> : <IconArrowDown/>
              }
            </button>
            <button onClick={filter3} className={`px-8 py-2  hover:text-primary font-semibold transition-all durantion-300  border rounded-xl cursor-pointer flex gap-1 justify-center items-center ${filter === 3 ? "border-primary text-primary" : " border-zinc-300 text-zinc-500"} `}>
              <p>Encerrando</p>
              <IconClock />
            </button>
          
          </div>
          <div className="w-[900px] h-[0.5px] bg-zinc-300 rounded-2xl my-2"/>
          <p className="text-zinc-500"> Foram encontrados <span className="font-semibold">{imoveisFiltrados.length}</span> imóveis</p>
          <div className=" flex flex-col gap-6">
            {
              imoveisFiltrados.length !== 0 ? 
                imoveisFiltrados.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                    ))
                :
                <div className="w-[900px] flex flex-col py-2 px-20 items-center justify-center gap-4">
                  <h3 className="text-3xl text-zinc-900 font-semibold">Ops! Nenhum resultado encontrado</h3>
                  <p className="text-zinc-600 text-center">Não há nenhum imóvel que se encaixa nos filtros aplicados. Pesquise novamente para encontrar seus imóveis </p>
                  <Image src={"/img/search-house.png"} alt="imovel não encontrado" width={400} height={150}/>
                </div>
            }
            </div>
        </section>
      </Template>
  )
}