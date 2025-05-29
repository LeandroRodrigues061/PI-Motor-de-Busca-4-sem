"use client";
import { useFiltro } from "@/context/FilterContext";
import { useState } from "react";
import { Button } from "../Button";
import bancos from "@/data/constants/Bancos";
import estados from "@/data/constants/Estados";

interface Cidade {
  nome: string;
  bairros: string[];
}

export default function SidebarFilters() {
  const { setFiltros, filtrarImoveis } = useFiltro();
  const [estadoSelecionado, setEstadoSelecionado] = useState<any | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(
    null
  );
  const [bairrosSelecionados, setBairrosSelecionados] = useState<string[]>([]);
  const [tipoImovel, setTipoImovel] = useState<string>("indiferente");
  const [valor, setValor] = useState<string>("");
  const [bancosSelecionados, setBancosSelecionados] = useState<string[]>([]);

  // Obtém as cidades disponíveis com base no estado selecionado
  const cidadesDisponiveis: Cidade[] = estadoSelecionado?.cidade || [];

  // Obtém os bairros disponíveis com base na cidade selecionada
  const bairrosDisponiveis: string[] =
    cidadesDisponiveis.find((c: Cidade) => c.nome === cidadeSelecionada)
      ?.bairros || [];

  const toggleBairro = (bairro: string) => {
    setBairrosSelecionados((prev: string[]) =>
      prev.includes(bairro)
        ? prev.filter((b: string) => b !== bairro)
        : [...prev, bairro]
    );
  };

  const handleBuscar = async () => {
    setFiltros({
      estado: estadoSelecionado?.name || null,
      cidade: cidadeSelecionada,
      bairros: bairrosSelecionados,
      tipoImovel,
      valor,
      banco: bancosSelecionados,
    });

    const imoveis = await filtrarImoveis();
    console.log("Imóveis filtrados:", imoveis);
  };

  return (
    <aside className="w-[340px] min-h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 ">
      <h2 className="text-zinc-500 font-semibold">
        Selecione as opções e facilite a sua busca
      </h2>
      <div className="flex flex-col gap-6">
        {/* Estado */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-zinc-900">Estado</h2>
          <select
            value={estadoSelecionado?.id || ""}
            className="border rounded-xl p-2 text-zinc-600"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const estado =
                estados.find(
                  (estado: any) => estado.id === Number(e.target.value)
                ) || null;
              setEstadoSelecionado(estado);
              setCidadeSelecionada(null);
              setBairrosSelecionados([]);
            }}
          >
            <option value="">Selecione o estado</option>
            {estados.map((estado: any) => (
              <option key={estado.id} value={estado.id}>
                {estado.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cidade */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-zinc-900">Cidade</h2>
          <select
            value={cidadeSelecionada || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setCidadeSelecionada(e.target.value);
              setBairrosSelecionados([]);
            }}
            disabled={!estadoSelecionado}
            className={`border rounded-xl p-2 text-zinc-600 ${
              !estadoSelecionado ? "cursor-no-drop" : ""
            }`}
          >
            <option value="">Selecione a cidade</option>
            {cidadesDisponiveis.map((cidade: Cidade) => (
              <option key={cidade.nome} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Bairros */}
        {cidadeSelecionada && (
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-zinc-900">Bairro</h2>
            {bairrosDisponiveis.map((bairro: string) => (
              <label key={bairro} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={bairro}
                  disabled={!estadoSelecionado}
                  className={`border rounded-xl p-2 text-zinc-600" ${
                    !estadoSelecionado ? "cursor-no-drop " : ""
                  }`}
                  checked={bairrosSelecionados.includes(bairro)}
                  onChange={() => toggleBairro(bairro)}
                />
                {bairro}
              </label>
            ))}
          </div>
        )}

        {/* Tipo de Imóvel */}
        <div className="flex flex-col gap-2 justify-between ">
          <label className="font-semibold text-xl text-zinc-900">
            Tipo de imóvel
          </label>
          <select
            value={tipoImovel}
            onChange={(e) => setTipoImovel(e.target.value)}
            disabled={!estadoSelecionado}
            className={`border rounded-xl p-2 text-zinc-600" ${
              !estadoSelecionado ? "cursor-no-drop " : ""
            }`}
          >
            <option value="indiferente">Indiferente</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        {/* Faixa de Valor */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-xl text-zinc-900">
            Faixa de valor
          </label>
          <select
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={!estadoSelecionado}
            className={`border rounded-xl p-2 text-zinc-600 text-sm ${
              !estadoSelecionado ? "cursor-no-drop " : ""
            }`}
          >
            <option className="text-xl" value="">
              Não especificado
            </option>
            <option value="<100000">Até R$ 100.000,00</option>
            <option value="100001-200000">
              R$ 100.000,01 - R$ 200.000,00{" "}
            </option>
            <option value="200002-400000">
              R$ 200.000,01 - R$ 400.000,00{" "}
            </option>
            <option value="400001-750000">
              R$ 400.000,01 - R$ 750.000,00{" "}
            </option>
            <option value=">750000">Acima de R$ 750.000,00 </option>
          </select>
        </div>
      </div>

      {/* Bancos */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-zinc-900">Bancos</h2>
        {bancos.map((banco) => (
          <label key={banco.id} className="flex gap-2">
            <input
              type="checkbox"
              value={banco.name}
              disabled={!estadoSelecionado}
              checked={bancosSelecionados.includes(banco.name)}
              onChange={() => {
                setBancosSelecionados((prev) =>
                  prev.includes(banco.name)
                    ? prev.filter((nome) => nome !== banco.name)
                    : [...prev, banco.name]
                );
              }}
            />
            {banco.name.charAt(0).toUpperCase() + banco.name.slice(1)}
          </label>
        ))}
      </div>

      <span className="w-full h-[0.5px] mt-6 mb-2 rounded-2xl bg-zinc-300"></span>

      <Button variant="primary" size="full" onClick={handleBuscar}>
        <p className="font-semibold">Buscar</p>
      </Button>
    </aside>
  );
}