"use client";
import Template from "@/components/layout/Template";
import { useSidebar } from "@/context/SideBarContext";
import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
export default function Perfil() {
  const { setTipo } = useSidebar();
  const setUserConfigSidebar = () => setTipo("user_config");
  useEffect(() => {
    setUserConfigSidebar();
  }, []);

  const [busca, setBusca] = useState("");
  const [imoveisPesquisados, setImoveisPesquisados] = useState(imoveis);
  
  useEffect(() => {
    const buscaLower = busca.toLowerCase();

    const pesquisados = imoveis.filter(
      (imovel) =>
        imovel.endereco.toLowerCase().includes(buscaLower) ||
        imovel.numeroImovel.toString().includes(buscaLower) ||
        imovel.banco.toLowerCase().includes(buscaLower)
    );

    setImoveisPesquisados(pesquisados);
  }, [busca]);
  return (
    <Template>
      <section className="flex flex-col p-8 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <div className="w-1 h-6 bg-primary rounded-lg" />
            <h1 className="text-3xl font-semibold text-zinc-900">
              Seus imóveis favoritos
            </h1>
          </div>
          <p className="text-zinc-500">
            Aqui você encontra todos os imóveis que você favoritou para
            acompanhar os leilões de forma rápida e prática.
          </p>
        </div>
        <div className="w-full h-[0.5px] bg-zinc-300 rounded-2xl my-2" />
        <div className="flex items-center justify-between my-1">
          <p className="text-zinc-500">
            Foram encontrados{" "}
            <span className="font-semibold">{imoveisPesquisados.length}</span>{" "}
            imóveis
          </p>

          <div className="w-80 h-12 flex items-center justify-between border border-zinc-300 text-zinc-500 rounded-lg px-3">
            <input
              type="text"
              placeholder="Pesquisar favoritos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 focus:border-none outline-none"
            />
            <IconSearch />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {imoveisPesquisados.length !== 0 ? (
            imoveisPesquisados.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))
          ) : (
            <div className="w-[900px] flex flex-col py-2 px-20 items-center justify-center gap-4">
              <h3 className="text-3xl text-zinc-900 font-semibold">
                Ops! Nenhum resultado encontrado
              </h3>
              <p className="text-zinc-600 text-center">
                Não há nenhum imóvel que com base na sua busca.
                Pesquise novamente para encontrar seus imóveis.
              </p>
              <Image
                src={"/img/search-house.png"}
                alt="imóvel não encontrado"
                width={400}
                height={150}
              />
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
