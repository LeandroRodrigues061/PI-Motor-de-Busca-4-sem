import { IconArrowDown, IconArrowUp, IconClock, IconCalendarEvent, IconBellDollar } from "@tabler/icons-react";
export interface subFiltrosProps{
  filter: string | null
  handleFiltro: (tipo: "valor" | "dataLeilao" | null) => void
  crescente: boolean
}
export default function SubFiltros(props: subFiltrosProps) {
  const {filter, handleFiltro, crescente} = props
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <button
        onClick={() => handleFiltro("valor")}
        className={`px-6 py-2 hover:text-primary font-semibold transition-all border rounded-xl cursor-pointer flex gap-1 items-center ${
          filter === "valor"
            ? "border-primary text-primary"
            : "border-zinc-300 text-zinc-500"
        }`}
      >
        Valor avaliação{" "}
        {filter === "valor" &&
          (crescente ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />)}
      </button>

      <button
        onClick={() => handleFiltro("dataLeilao")}
        className={`px-6 py-2 hover:text-primary font-semibold transition-all border rounded-xl cursor-pointer flex gap-1 items-center ${
          filter === "dataLeilao"
            ? "border-primary text-primary"
            : "border-zinc-300 text-zinc-500"
        }`}
      >
        Data Leilão{" "}
        {filter === "dataLeilao" &&
          (crescente ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />)}
      </button>

    </div>
  );
}
