"use client";
import { useState } from "react";
import estados from "@/data/constants/Estados";
import Estado from "@/data/models/Estado";
import { Button } from "./Button";
interface sideBarProps {
  onBuscar: (filtros: {
    estado: Estado | null;
    cidade: string | null;
    bairros: string[];
    tipoImovel: string;
    valor: string;
  }) => void;
}

interface Cidade {
  nome: string;
  bairros: string[];
}

export default function Sidebar({onBuscar} :sideBarProps) {
  const [estadoSelecionado, setEstadoSelecionado] = useState<Estado | null>(
    null
  );
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(
    null
  );
  const [bairrosSelecionados, setBairrosSelecionados] = useState<string[]>([]);
  const [tipoImovel, setTipoImovel] = useState<string>("indiferente");
  const [valor, setValor] = useState<string>("");
  const cidadesDisponiveis: Cidade[] = estadoSelecionado?.cidade || [];

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

  return (
    <aside className="w-96 h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 ">
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
                  (estado: Estado) => estado.id === Number(e.target.value)
                ) || null;
              setEstadoSelecionado(estado);
              setCidadeSelecionada(null);
              setBairrosSelecionados([]);
            }}
          >
            <option value="" >Selecione o estado</option>
            {estados.map((estado: Estado) => (
              <option key={estado.id} value={estado.id} >
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
            className={`border rounded-xl p-2 text-zinc-600 ${!estadoSelecionado ? "cursor-no-drop" : ""}`}
          >
            <option value="">Selecione a cidade</option>
            {cidadesDisponiveis.map((cidade: Cidade) => (
              <option key={cidade.nome} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Bairros (checkbox múltiplo) */}
        {cidadeSelecionada && (
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-zinc-900">Bairro</h2>
            {bairrosDisponiveis.map((bairro: string) => (
              <label key={bairro} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={bairro}
                  disabled={!estadoSelecionado}
                  className={`border rounded-xl p-2 text-zinc-600" ${!estadoSelecionado ? "cursor-no-drop " : ""}`}
                  checked={bairrosSelecionados.includes(bairro)}
                  onChange={() => toggleBairro(bairro)}
                />
                {bairro}
              </label>
            ))}
          </div>
        )}

              {/* Tipo de Imóvel */}
      <div className="flex justify-between ">
        <label className="font-semibold text-xl text-zinc-900">Tipo de imóvel:</label>
        <select
          value={tipoImovel}
          onChange={(e) => setTipoImovel(e.target.value)}
          disabled={!estadoSelecionado}
          className={`border rounded-xl p-2 text-zinc-600" ${!estadoSelecionado ? "cursor-no-drop " : ""}`}
        >
          <option value="indiferente">Indiferente</option>
          <option value="casa">Casa</option>
          <option value="apartamento">Apartamento</option>
          <option value="outros">Outros</option>
        </select>
      </div>
              {/* faixa de valor */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-xl text-zinc-6  00">Faixa de valor:</label>
        <select
          value={tipoImovel}
          onChange={(e) => setTipoImovel(e.target.value)}
          disabled={!estadoSelecionado}
          className={`border rounded-xl p-2 text-zinc-600" ${!estadoSelecionado ? "cursor-no-drop " : ""}`}
        >
          <option value=">100000">Até R$ 100.000,00</option>
          <option value="100001-200000">R$ 100.000,01 - - - R$ 200.000,00 </option>
          <option value="200002-400000">R$ 200.000,01 - - - R$ 400.000,00 </option>
          <option value="400001-750000">R$ 400.000,01 - - - R$ 750.000,00 </option>
          <option value="> 750000">Acima de R$ 750.000,00 </option>
        </select>
      </div>

        {/* Resultado */}
        <div className="my-4 p-2 bg-gray-100 rounded">
          <strong>Filtro aplicado:</strong>
          <div>Estado: {estadoSelecionado?.name || "Nenhum"}</div>
          <div>Cidade: {cidadeSelecionada || "Nenhuma"}</div>
          <div>Bairros: {bairrosSelecionados.join(", ") || "Nenhum"}</div>
        </div>
      </div>
      <span className="w-full h-[0.5px] rounded-2xl bg-zinc-300"></span>
      <Button variant="primary" size="full" onClick={() =>
        onBuscar({
          estado: estadoSelecionado,
          cidade: cidadeSelecionada,
          bairros: bairrosSelecionados,
          tipoImovel,
          valor
        })
      }>

        
        <p className="font-semibold">Buscar</p>
      </Button>
    </aside>
  );
}
