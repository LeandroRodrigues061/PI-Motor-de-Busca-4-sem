"use client";
import Template from "@/components/layout/Template";
import { useSidebar } from "@/context/SideBarContext";
import { useEffect, useState, useMemo } from "react"; // Adicionei useMemo
import { IconSearch } from "@tabler/icons-react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // 1. IMPORTE O HOOK useAuth
import { Imovel } from "@/data/models/Imovel";

export default function Perfil() {
  const { setTipo } = useSidebar();
  const { user, isLoading, isAuthenticated } = useAuth(); 
  useEffect(() => {
    setTipo("user_config");
  }, [setTipo]); 

  const [busca, setBusca] = useState("");
  const [imoveisFavoritos, setImoveisFavoritos] = useState<Imovel[]>([]); 

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.id) {
      const fetchFavoritos = async () => {
        try {
          const response = await fetch(`/api/favoritos/buscarFavoritos?userId=${user.id}`);
          if (!response.ok) {
            return console.log(`Erro na API: ${response.status}`);
          }
          const data = await response.json();
          setImoveisFavoritos(data.favoritos || []); // Garante que seja um array
        } catch (error) {
          console.error("Erro ao buscar favoritos:", error);
          setImoveisFavoritos([]); // Limpa em caso de erro para evitar problemas
        }
      };

      fetchFavoritos();
    } else if (!isLoading && !isAuthenticated) {
      setImoveisFavoritos([]);
    }
  }, [user, isLoading, isAuthenticated]); // Dependências corretas

  const imoveisPesquisados = useMemo(() => {
    if (!busca) {
      return imoveisFavoritos; // Se não houver busca, retorna todos os favoritos
    }
    return imoveisFavoritos.filter((imovel) => {
      // Adapte esta lógica de filtro conforme necessário.
      // Exemplo: buscando no título do imóvel (supondo que imovel tenha uma propriedade 'titulo')
      return imovel.endereco?.toLowerCase().includes(busca.toLowerCase());
    });
  }, [busca, imoveisFavoritos]);

  // 5. ADICIONE TRATAMENTO PARA LOADING E NÃO AUTENTICADO
  if (isLoading) {
    return (
      <Template>
        <div className="flex justify-center items-center h-screen">
          <p>Carregando seus favoritos...</p>
        </div>
      </Template>
    );
  }

  if (!isAuthenticated) {
    // Idealmente, você poderia redirecionar para o login aqui ou mostrar um botão para login
    return (
      <Template>
        <div className="flex flex-col justify-center items-center h-screen p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Acesso Negado</h2>
          <p className="text-zinc-600">
            Você precisa estar logado para ver seus imóveis favoritos.
          </p>
          {/* Você pode adicionar um botão para redirecionar ao login aqui */}
        </div>
      </Template>
    );
  }

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
            {/* AGORA USA imoveisPesquisados.length */}
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
          {/* AGORA USA imoveisPesquisados */}
          {imoveisPesquisados.length > 0 ? (
            imoveisPesquisados.map((imovel) => (
              <ImovelCard key={imovel._id} imovel={imovel} />
            ))
          ) : (
            <div className="w-[900px] flex flex-col py-2 px-20 items-center justify-center gap-4">
              <h3 className="text-3xl text-zinc-900 font-semibold">
                {busca ? "Ops! Nenhum resultado para sua busca" : "Você ainda não tem favoritos"}
              </h3>
              <p className="text-zinc-600 text-center">
                {busca ? "Tente refinar sua pesquisa ou explore mais imóveis para adicionar aos seus favoritos." : "Explore nossos imóveis e adicione os que mais gostar aos seus favoritos!"}
              </p>
              <Image
                src={"/img/search-house.png"} // Verifique se este caminho está correto
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