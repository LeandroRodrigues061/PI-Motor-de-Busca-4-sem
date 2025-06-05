"use client";
import { useSidebar } from "@/context/SideBarContext";
import useWindowSize from "@/hooks/useWindowSize";
import { IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";

export default function SideBarUserConfig() {
  const [option, setOption] = useState("favoritos");
  const modeFavorite = () => setOption("favoritos");
  const {toggleSideBar,  } = useSidebar()

  const { width } = useWindowSize();
  return (
    <>
      <aside className=" md:w-[340px] min-h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 ">
        <div className="w-full  md:hidden">
          <button onClick={() => toggleSideBar}>
            <IconArrowRight />
          </button>
        </div>
        <h2 className="text-zinc-500 font-semibold">Aqui é o seu perfil</h2>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-zinc-900 text-2xl font-semibold">
            Nicolas Yanase
          </h1>
          <p className="text-zinc-600">Analista de crédito Imobiliário</p>
        </div>

        <span className="w-full h-[0.5px] my-3 rounded-2xl bg-zinc-300"></span>

        <div
          className={`w-full p-4 rounded-xl cursor-pointer ${
            option === "favoritos" ? "bg-[#BFDBFE]" : ""
          }`}
        >
          <p
            className={`text-xl  font-semibold hover:text-primary transition-colors duration-300 ${
              option === "favoritos" ? "text-primary" : "text-zinc-600 "
            }`}
          >
            Favoritos
          </p>
        </div>
      </aside>
    </>
  );
}
