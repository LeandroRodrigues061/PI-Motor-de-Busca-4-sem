import Image from "next/image";
import { Button } from "../Button";
import { IconHeart } from "@tabler/icons-react";
import { Imovel } from "@/data/models/Imovel";
import bancos from "@/data/constants/Bancos";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export interface imovelProps {
  imovel: Imovel;
}

export default function ImovelCard({ imovel }: imovelProps) {
  const { user, favorites, addFavorite, removeFavorite } = useAuth();
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const isFavorite = favorites.some(favId => favId.toString() === imovel._id.toString());
  
  const formaPagamento = ['financiamento', 'débito', 'crédito']

  const toggleFavorite = async () => {
    if (!user || !user.id) {
      alert("Você precisa estar logado para adicionar aos favoritos.");
      return;
    }
  
    if (!imovel?._id) {
      console.error("ID do imóvel não encontrado para favoritar.");
      return;
    }
  
    const imovelId = imovel._id.toString();
  
    setIsLoadingFavorite(true);
  
    try {
      if (isFavorite) {
        console.log("Removendo favorito:", imovelId);
        await removeFavorite(imovelId);
      } else {
        console.log("Adicionando favorito:", imovelId);
        await addFavorite(imovelId);
      }
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <div key={imovel._id} className="border border-zinc-300 p-6 rounded-xl bg-white justify-between items-center lg:items-start md:w-full lg:w-[700px] xl:w-[900px] 2xl:w-[1000px] flex flex-col lg:flex-row gap-6 relative">
      <div className="relative rounded-xl w-full h-72 lg:w-72 lg:h-52 overflow-hidden">
        <Image src={imovel.imagem || "/img/search-house.png"} alt="imagem da casa" fill className="object-cover lg:object-contain" unoptimized />
        <button 
          onClick={toggleFavorite}
          className="lg:hidden absolute size-8 flex items-center justify-center bg-zinc-200 rounded-lg right-2 top-2 cursor-pointer">
          {isFavorite ? (
            <IconHeart size={30} className="text-primary fill-primary" />
          ) : (
            <IconHeart size={30} className="text-gray-500 hover:text-primary" />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-[7px] w-full">
      <div className="flex gap-1">
        <p className="text-zinc-600">Data do leilão:</p>
        {Array.isArray(imovel.datas_leiloes) &&
        imovel.datas_leiloes.map((data, index) => (
             <span key={index}  className="text-zinc-800 font-semibold">  
          {new Date(data).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          })}</span>
        ))}
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Número do imóvel:</p>
        <p className="text-zinc-800 font-semibold">{imovel.numero_imovel}</p>
      </div>  
      <div className="flex gap-1">
        <p className="text-zinc-600">Valor de avaliação:</p>
        <p className="text-zinc-800 font-semibold">
        {imovel.valor_avaliacao && typeof imovel.valor_avaliacao === "number"
          ? imovel.valor_avaliacao.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          })
          : " Não informado"}
          </p>
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Valor mínimo de venda:</p>
        <p className="text-zinc-800 font-semibold">
          {typeof imovel.valor_minimo_1_leilao === "number"
            ? imovel.valor_minimo_1_leilao.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
           })
          : " Não informado"}</p>
      </div>
      {/* 
      ::: FORMAS DE PAGAMENTO :::
      <div className="flex gap-1">
        <p className="text-zinc-600">Pagamentos:</p> 
        <div className="flex flex-wrap gap-1">
          {
            
            formaPagamento.map((forma) => (
              <div className="flex items-center justify-center px-3 p-1 text-sm bg-secondary rounded-lg font-semibold text-white">
                <p>{forma}</p>
              </div>
            ))
          }
        </div>
      </div> */}
      <div className="flex gap-1">
        <p className="text-zinc-600">Endereço:</p>
        <p className="text-zinc-800 font-semibold">{imovel.endereco}</p>
      </div>
      <div className="flex lg:hidden gap-1 items-center">
          <p className="text-zinc-600">Banco:</p>
          {bancos.map((banco) =>
            banco.name === imovel.banco ? (
              <div key={banco.id} className="size-8 rounded-xl relative">
                <Image
                  src={banco.image}
                  alt={banco.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div key={banco.id} className="hidden "></div>
            )
          )}
        </div>
      <Button variant="primary" size="default" className="">
        <a
          href={imovel.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold"
        >
          Veja no site do leilão
        </a>
      </Button>
    </div>
    <div className="hidden lg:flex flex-col items-center justify-between h-full">
        {bancos.map((banco) =>
          banco.name === imovel.banco ? (
            <div key={banco.id} className="size-12 rounded-xl relative">
              <Image src={banco.image} alt={banco.name} fill className="object-cover" />
            </div>
          ) : (
            <div key={banco.id} className="hidden"></div>
          )
        )}
      </div>
      <button
          className="hidden lg:flex absolute bottom-6 right-6 cursor-pointer mt-auto p-2 disabled:opacity-50"
          onClick={toggleFavorite}
          disabled={isLoadingFavorite}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {isFavorite ? (
            <IconHeart size={30} className="text-primary fill-primary" />
          ) : (
            <IconHeart size={30} className="text-gray-400 hover:text-primary" />
          )}
        </button>
    </div>
  );
}
