"use client"
import Header from "./Header";
import SideBar from "../SideBar";
import { useState } from "react";
import { Imovel } from "@/data/models/Imovel";
import { imoveis } from "@/data/constants/Imoveis";
import { FiltroProvider } from "@/context/FilterContext";
export interface templateProps {
  className?: string; //tem que ter pois iremos usar classname no componente
  children: React.ReactNode; //tem que ter pois iremos colocar elementos filhos dentro deste componente
}
export default function Template(props: templateProps) {
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
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

  return (
    <FiltroProvider>
      <div className="flex flex-col">
        <Header />
        <main
          className={`w-full flex items-start justify-start gap-4 ${
            props.className ?? ``
          }`}
        >
          <SideBar />
          {props.children}
        </main>
      </div>
    </FiltroProvider>
  );
}
