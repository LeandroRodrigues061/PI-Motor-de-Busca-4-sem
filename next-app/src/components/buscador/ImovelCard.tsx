import Image from "next/image";
import { Button } from "../Button";
import { IconHeart } from "@tabler/icons-react";
import { Imovel } from "@/data/models/Imovel";
import bancos from "@/data/constants/Bancos";

export interface imovelProps {
  imovel: Imovel;
}

export default function ImovelCard(props: imovelProps) {
  const { imovel } = props
  
  return(
    <div key={imovel._id} className="border border-zinc-300 p-6 rounded-xl bg-white justify-between items-start w-[900px] h-[320px] flex gap-8">
    <div className="relative rounded-xl w-72 h-52">
      <Image src={imovel.imagem || "/img/search-house.png"} alt="imagem da casa" fill className="object-contain"/>
    </div>
    <div className="flex flex-col gap-[7px] w-full">
      <div className="flex gap-1">
        <p className="text-zinc-600">Data do leilão:</p>
        {imovel.datas_leiloes.map((data, index) => (
        <span key={index}>{data}</span>
        ))}
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Número do imóvel:</p>
        <p className="text-zinc-800 font-semibold">{imovel.numero_imovel}</p>
      </div>  
      <div className="flex gap-1">
        <p className="text-zinc-600">Valor de avaliação:</p>
        <p className="text-zinc-800 font-semibold">R$ {imovel.valor_avaliacao}</p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Valor mínimo de venda:</p>
        <p className="text-zinc-800 font-semibold">R$   
          {typeof imovel.valor_minimo_1_leilao === "number"
            ? imovel.valor_minimo_1_leilao.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
           })
          : "Não informado"}</p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Endereço:</p>
        <p className="text-zinc-800 font-semibold">{imovel.endereco}</p>
      </div>
      <a
          href={imovel.link} 
          target="_blank"
          rel="noopener noreferrer"
        >
        <Button variant="primary" size="default" className="" > 
          <p className="font-semibold">Veja no site do leilão</p>
        </Button>
      </a>
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
  );
}
