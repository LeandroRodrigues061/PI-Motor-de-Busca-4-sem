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
    <div key={imovel._id} className="border border-zinc-300 p-6 rounded-xl bg-white justify-between items-start w-[900px] h-[320px] flex gap-8">
      <div className="relative rounded-xl w-72 h-52">
        <Image src={imovel.imagem || "/img/search-house.png"} alt="imagem da casa" fill className="object-contain" />
      </div>
      <div className="flex flex-col gap-[7px] w-full">
      <div className="flex gap-1">
        <p className="text-zinc-600">Data do leilão:</p>
        {imovel.datas_leiloes.map((data, index) => (
             <span key={index}>  
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
      </div>
      <div className="flex gap-1">
        <p className="text-zinc-600">Endereço:</p>
        <p className="text-zinc-800 font-semibold">{imovel.endereco}</p>
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
    <div className="flex flex-col items-center justify-between h-full">
        {bancos.map((banco) =>
          banco.name === imovel.banco ? (
            <div key={banco.id} className="size-12 rounded-xl relative">
              <Image src={banco.image} alt={banco.name} fill className="object-cover" />
            </div>
          ) : (
            <div key={banco.id} className="hidden"></div>
          )
        )}

        <button
          className="cursor-pointer mt-auto p-2 disabled:opacity-50"
          onClick={toggleFavorite}
          disabled={isLoadingFavorite}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {isFavorite ? (
            <IconHeart size={30} className="text-red-500 fill-red-500" />
          ) : (
            <IconHeart size={30} className="text-gray-400 hover:text-red-400" />
          )}
        </button>
      </div>
    </div>
  );
}
