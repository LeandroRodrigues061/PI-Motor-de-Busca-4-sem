'use client'
import Template from "@/components/layout/Template";
import { useState } from "react";
import { Imovel } from "@/data/models/Imovel";

interface buscadorProps {
  imoveisFiltrados: Imovel[];
}

export default function Buscador({ imoveisFiltrados }: buscadorProps){
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
    const [isFavorite, setIsFavorite ] = useState(false);
    const toggleFavorite = () => {
      setIsFavorite(!isFavorite)
    }
  return(
      <Template>
        <section></section>
      </Template>
  )
}