import Image from "next/image";
import { Button } from "../Button";
import { IconHeart } from "@tabler/icons-react";
import { Imovel } from "@/data/models/Imovel";
import bancos from "@/data/constants/Bancos";
import { useEffect, useState } from "react";

export interface imovelProps{
  imovel: Imovel
}
export default function ImovelCard(props: imovelProps) {
  const { imovel } = props

  const [tempoRestante, setTempoRestante] = useState({
    dias: imovel.tempoRestante.dias,
    horas: imovel.tempoRestante.horas,
    minutos: imovel.tempoRestante.minutos,
    segundos: imovel.tempoRestante.segundos,
  });
  
  useEffect(() => {
    // Converte o tempo inicial em milissegundos
    const tempoFinal =
      Date.now() +
      (((tempoRestante.dias * 24 + tempoRestante.horas) * 60 +
        tempoRestante.minutos) *
        60 +
        tempoRestante.segundos) *
        1000;
  
    const interval = setInterval(() => {
      const agora = Date.now();
      const diferenca = tempoFinal - agora;
  
      if (diferenca <= 0) {
        clearInterval(interval);
        setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
      } else {
        const totalSegundos = Math.floor(diferenca / 1000);
        const dias = Math.floor(totalSegundos / (60 * 60 * 24));
        const horas = Math.floor((totalSegundos % (60 * 60 * 24)) / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
  
        setTempoRestante({ dias, horas, minutos, segundos });
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  return(
    <div key={imovel.id} className="border border-zinc-300 p-6 rounded-xl bg-white justify-between items-start w-[900px] h-[280px] flex gap-6">
    <div className="relative rounded-xl w-72 h-52">
      <Image src={imovel.imagem} alt="imagem da casa" fill className="object-contain"/>
    </div>
    <div className="flex flex-col gap-[7px] w-full">
      <div className="flex gap-[6px] items-center">
        <p className="text-zinc-600">Tempo restante:</p>
        <div className="bg-secondary w-24 flex justify-center items-center py-[3px] rounded-xl">
          <p className="text-white font-semibold">{tempoRestante.dias} dias</p>
        </div>
        <div className="bg-secondary w-24 flex justify-center items-center py-[3px] rounded-xl">
          <p className="text-white font-semibold">{tempoRestante.horas} horas</p>
        </div>
        <div className="bg-secondary w-24 flex justify-center items-center py-[3px] rounded-xl">
          <p className="text-white font-semibold">{tempoRestante.minutos} min</p>
        </div>
        <div className="bg-secondary w-24 flex justify-center items-center py-[3px] rounded-xl">
          <p className="text-white font-semibold">{tempoRestante.segundos} seg</p>
        </div>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Data do leilão:</p>
        <p className="text-zinc-800 font-semibold">{imovel.dataLeilao}</p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Número do imóvel:</p>
        <p className="text-zinc-800 font-semibold">{imovel.numeroImovel}</p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Valor de avaliação:</p>
        <p className="text-zinc-800 font-semibold">{imovel.valorAvaliacao}</p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Valor mínimo de venda:</p>
        <p className="text-zinc-800 font-semibold">{imovel.valorMinimoVenda}</p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Endereço:</p>
        <p className="text-zinc-800 font-semibold">{imovel.endereco}</p>
      </div>
      <Button variant="primary" size="default" className="" > <p className="font-semibold">Veja no site do leilão</p></Button>
    </div>
    <div className="flex flex-col items-center justify-between h-full">
      {
        bancos.map((banco)  => (
          banco.name === imovel.banco ? 
          <div key={banco.id} className="size-12 rounded-xl relative">
            <Image src={banco.image} alt={banco.name} fill className="object-cover"/>
          </div>
          :   
          <div key={banco.id} className="hidden "></div>
        ))
      }
      
      <IconHeart size={30} />
       {/* <button className="cursor-pointer" onClick={toggleFavorite}>
      { isFavorite ?
        <IconHeart size={30} className="text-red-500"/> : <IconHeart size={30} />
        }
                  </button>  */}
    </div>
  </div>
  )
}