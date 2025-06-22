"use client";
import { useFiltro } from "@/context/FilterContext";
import { useState, useEffect } from "react";
import { Button } from "../Button";
import bancos from "@/data/constants/Bancos";
import estados from "@/data/constants/Estados";
import { useSidebar } from "@/context/SideBarContext";
import { IconArrowLeft } from "@tabler/icons-react";
import { parseCookies } from 'nookies';

export default function SidebarFilters() {
  const {isOpenSidebar, toggleSidebar } = useSidebar()
  const { buscarComFiltros } = useFiltro();
  const [estadoSelecionado, setEstadoSelecionado] = useState<any | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(
    null
  );
  const [bairrosSelecionados, setBairrosSelecionados] = useState<string[]>([]);
  const [tipoImovel, setTipoImovel] = useState<string>("indiferente");
  const [valor, setValor] = useState<string>("");
  const [bancosSelecionados, setBancosSelecionados] = useState<string[]>([]);
  const cidadesDisponiveis: { nome: string }[] = estadoSelecionado?.cidade || [];
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>([]);

  const fetchBairros = async () => {
    try {
      const cookies = parseCookies();
      const token = cookies['auth.token'];
      if (!token) {
        throw new Error("Token não encontrado na sessão.");
      }
      const response = await fetch("/api/bairros", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar os bairros.");
      }
      setBairrosDisponiveis(data.bairros);
    } catch (error) {
      console.error("Erro ao buscar bairros:", error);
    }
  };

  const toggleBairro = (bairro: string) => {
    setBairrosSelecionados((prev: string[]) => {
      const updatedBairros = prev.includes(bairro)
        ? prev.filter((b: string) => b !== bairro)
        : [...prev, bairro];
      console.log("Bairros selecionados:", updatedBairros); // Log para depuração
      return updatedBairros;
    });
  };

  const handleBuscar = () => {
    buscarComFiltros({
      estado: estadoSelecionado?.name || null,
      cidade: cidadeSelecionada,
      bairro: bairrosSelecionados,
      tipoImovel,
      valor,
      banco: bancosSelecionados,
    });
  };

  useEffect(() => {
      fetchBairros();
  } , []);
  
  return (
    <>
     <aside className="hidden md:flex w-[340px] min-h-screen border-r border-zinc-200 p-8 flex-col gap-4 ">
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
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            disabled={!estadoSelecionado}
            className={`border rounded-xl p-2 text-zinc-600 ${
              !estadoSelecionado ? "cursor-no-drop" : ""
            }`}
          >
            <option value="">Selecione uma cidade</option>
            {cidadesDisponiveis.map((cidadeObj, index) => (
              <option key={index} value={cidadeObj.nome}>
                {cidadeObj.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Bairros */}
        {cidadeSelecionada && (
          <div className="flex flex-col gap-1 h-48 overflow-y-auto">
            <h2 className="text-xl font-semibold text-zinc-900">Bairro</h2>
            {bairrosDisponiveis.map((bairro: string) => (
              <label key={bairro || ""} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={bairro || "Bairro nao encontrado"} 
                  disabled={!estadoSelecionado}
                  className={`border rounded-xl p-2 text-zinc-600 ${
                    !estadoSelecionado ? "cursor-no-drop " : ""
                  }`}
                  checked={bairrosSelecionados.includes(bairro || "")} 
                  onChange={() => toggleBairro(bairro || "")} 
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
            className={`border rounded-xl p-2 text-zinc-600 `}
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
            className={`border rounded-xl p-2 text-zinc-600 text-sm`}
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

    { 
    isOpenSidebar ? (
    
    <aside className="fixed inset-0 bg-white z-50 w-[300px] min-h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 overflow-y-auto">
      <div className="w-full md:hidden"> 
        <button onClick={toggleSidebar} className="size-10 flex items-center justify-center bg-white shadow-lg cursor-pointer rounded-full text-zinc-600">
          <IconArrowLeft />
        </button>
      </div>
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
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            disabled={!estadoSelecionado}
            className={`border rounded-xl p-2 text-zinc-600 ${
              !estadoSelecionado ? "cursor-no-drop" : ""
            }`}
          >
            <option value="">Selecione uma cidade</option>
            {cidadesDisponiveis.map((cidadeObj, index) => (
              <option key={index} value={cidadeObj.nome}>
                {cidadeObj.nome}
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
            className={`border rounded-xl p-2 text-zinc-600" `}
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
            className={`border rounded-xl p-2 text-zinc-600 text-sm `}
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
    ) 
    :
    (
    <></>
    )
  }
    </>
  );
} 