"use client";
import Template from "@/components/layout/Template";
import { useState, useEffect } from "react";
import ImovelCard from "@/components/buscador/ImovelCard";
import Image from "next/image";
import SubFiltros from "@/components/buscador/SubFiltros";
import { useFiltro } from "@/context/FilterContext";
import { useSidebar } from "@/context/SideBarContext";
import { IconArrowRight } from "@tabler/icons-react";

export default function Buscador() {
  const { setTipo } = useSidebar();
  useEffect(() => {
    setTipo("filter");
  }, []);
  const { toggleSidebar } = useSidebar();
  const [filter, setFilter] = useState<"valor" | "dataLeilao" | null>(null);
  const [crescente, setCrescente] = useState(false);
  const { imoveis: fetchedImoveis } = useFiltro();
  const [sortedImoveis, setSortedImoveis] = useState<Imovel[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Estado para a página atual
  const itemsPerPage = 15; // Número de imóveis por página

  const handleFiltro = (tipo: "valor" | "dataLeilao" | null) => {
    if (filter === tipo) {
      setCrescente(!crescente);
    } else {
      setFilter(tipo);
      setCrescente(true);
    }
  };

  useEffect(() => {
    let imoveisParaOrdenar = [...fetchedImoveis];

    const compararDatas = (
      datasLeiloesA?: Date[],
      datasLeiloesB?: Date[]
    ): number => {
      const dateObjA = datasLeiloesA?.[0];
      const dateObjB = datasLeiloesB?.[0];

      if (dateObjA && dateObjB) {
        return new Date(dateObjA).getTime() - new Date(dateObjB).getTime();
      }

      if (dateObjA) return -1;
      if (dateObjB) return 1;

      return 0;
    };

    if (filter === "valor") {
      imoveisParaOrdenar.sort((a, b) => {
        const valorA = a.valor_avaliacao;
        const valorB = b.valor_avaliacao;

        let comparacao = 0;
        if (isNaN(valorA) && isNaN(valorB)) comparacao = 0;
        else if (isNaN(valorA)) comparacao = 1; // NaNs no final
        else if (isNaN(valorB)) comparacao = -1; // NaNs no final
        else comparacao = valorA - valorB;

        return crescente ? comparacao : comparacao * -1;
      });
    } else if (filter === "dataLeilao") {
      imoveisParaOrdenar.sort((a, b) => {
        return crescente
          ? compararDatas(a.datas_leiloes, b.datas_leiloes) // Ascendente: datas mais antigas primeiro
          : compararDatas(b.datas_leiloes, a.datas_leiloes); // Descendente: datas mais recentes primeiro
      });
    } else if (filter === null) {
      // Ordenação padrão quando nenhum filtro está ativo
      if (!crescente) {
        imoveisParaOrdenar.sort((a, b) =>
          compararDatas(b.datas_leiloes, a.datas_leiloes)
        );
      } else {
        imoveisParaOrdenar.sort((a, b) =>
          compararDatas(a.datas_leiloes, b.datas_leiloes)
        );
      }
    }

    setSortedImoveis(imoveisParaOrdenar);
    setCurrentPage(1); // Reinicia para a primeira página ao alterar os filtros
  }, [fetchedImoveis, filter, crescente]);

  // Calcular os imóveis para a página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImoveis = sortedImoveis.slice(startIndex, endIndex);

  // Calcular o número total de páginas
  const totalPages = Math.ceil(sortedImoveis.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Template>
      <section className="w-full flex flex-col p-8 gap-4">
        <div className="w-full md:hidden">
          <button
            onClick={toggleSidebar}
            className="size-10 flex items-center justify-center bg-white shadow-lg cursor-pointer rounded-full text-zinc-600"
          >
            <IconArrowRight />
          </button>
        </div>
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
          Foram encontrados{" "}
          <span className="font-semibold">{sortedImoveis.length}</span> imóveis
        </p>

        <div className="flex flex-col gap-6">
          {currentImoveis.length !== 0 ? (
            currentImoveis.map((imovel) => (
              <ImovelCard key={imovel._id} imovel={imovel} />
            ))
          ) : (
            <div className="w-full max-w-lg mx-auto flex flex-col py-10 px-4 items-center justify-center gap-4 text-center">
              <h3 className="text-2xl md:text-3xl text-zinc-900 font-semibold">
                Ops! Nenhum resultado encontrado
              </h3>
              <p className="text-zinc-600 text-center">
                Não há nenhum imóvel que se encaixa nos filtros aplicados.
                Pesquise novamente para encontrar seus imóveis.
              </p>
              <Image
                src={"/img/search-house.png"}
                alt="imóvel não encontrado"
                width={300}
                height={112}
              />
            </div>
          )}
          <div className="pagination flex justify-center gap-2 mt-4 w-3xl">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {(() => {
              const pages = [];

              // Adiciona sempre a primeira página
              if (1 === currentPage) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 border rounded-lg bg-primary text-white"
                  >
                    1
                  </button>
                );
              } else {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    1
                  </button>
                );
              }

              // Adiciona "..." se necessário
              if (currentPage > 4) {
                pages.push(
                  <span key="start-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }

              // Páginas antes e depois da atual
              for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                if (i > 1 && i < totalPages) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === i
                          ? "bg-primary text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
              }

              // Adiciona "..." antes da última se necessário
              if (currentPage < totalPages - 3) {
                pages.push(
                  <span key="end-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }

              // Adiciona sempre a última página (se for mais que 1)
              if (totalPages > 1) {
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === totalPages
                        ? "bg-primary text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>

        {/* Botões de paginação
        <div className="pagination flex justify-center gap-2 mt-4 w-3xl">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div> */}
      </section>
    </Template>
  );
}
