"use client";
import { useSidebar } from "@/context/SideBarContext";
import useWindowSize from "@/hooks/useWindowSize";
import { IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePerfilOption } from "@/context/PerfilOptionContext";

export default function SideBarUserConfig() {
  const { user } = useAuth();
  const modeFavorite = () => setOption("favoritos");
  const { toggleSidebar, isOpenSidebar } = useSidebar();
  const {option, setOption } = usePerfilOption()
  return (
    <>
      <aside className="hidden md:flex w-[340px] min-h-screen border-r border-zinc-200 p-8 flex-col gap-4 ">
        <div className="w-full  md:hidden">
          <button onClick={() => toggleSidebar}>
            <IconArrowRight />
          </button>
        </div>
        <h2 className="text-zinc-500 font-semibold">Aqui é o seu perfil</h2>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-zinc-900 text-2xl font-semibold">{user?.nome}</h1>
          <p className="text-zinc-600">{user?.cargo}</p>
        </div>

        <span className="w-full h-[0.5px] my-3 rounded-2xl bg-zinc-300"></span>

         <div
            onClick={() => setOption('config')}
            className={`w-full p-4 rounded-xl cursor-pointer ${
              option === "config" ? "bg-[#BFDBFE]" : ""
            }`}
          >
            <p
              className={`text-xl  font-semibold hover:text-primary transition-colors duration-300 ${
                option === "config" ? "text-primary" : "text-zinc-600 "
              }`}
            >
              Dados pessoais
            </p>
          </div>
          <div
           onClick={() => setOption('favorites')}
            className={`w-full p-4 rounded-xl cursor-pointer ${
              option === "favorites" ? "bg-[#BFDBFE]" : ""
            }`}
          >
            <p
              className={`text-xl  font-semibold hover:text-primary transition-colors duration-300 ${
                option === "favorites" ? "text-primary" : "text-zinc-600 "
              }`}
            >
              Favoritos
            </p>
          </div>
      </aside>
      {isOpenSidebar ? (
        <aside className="fixed inset-0 bg-white z-50 w-[300px] min-h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 overflow-y-auto">
          <div className="w-full md:hidden">
            <button
              onClick={toggleSidebar}
              className="size-10 flex items-center justify-center bg-white shadow-lg cursor-pointer rounded-full text-zinc-600"
            >
              <IconArrowRight />
            </button>
          </div>
          <h2 className="text-zinc-500 font-semibold">Aqui é o seu perfil</h2>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-zinc-900 text-2xl font-semibold">
              {user?.nome}
            </h1>
            <p className="text-zinc-600">{user?.cargo}</p>
          </div>

          <span className="w-full h-[0.5px] my-3 rounded-2xl bg-zinc-300"></span>

          <div
            onClick={() => setOption('config')}
            className={`w-full p-4 rounded-xl cursor-pointer ${
              option === "config" ? "bg-[#BFDBFE]" : ""
            }`}
          >
            <p
              className={`text-xl  font-semibold hover:text-primary transition-colors duration-300 ${
                option === "config" ? "text-primary" : "text-zinc-600 "
              }`}
            >
              Dados pessoais
            </p>
          </div>
          <div
           onClick={() => setOption('favorites')}
            className={`w-full p-4 rounded-xl cursor-pointer ${
              option === "favorites" ? "bg-[#BFDBFE]" : ""
            }`}
          >
            <p
              className={`text-xl  font-semibold hover:text-primary transition-colors duration-300 ${
                option === "favorites" ? "text-primary" : "text-zinc-600 "
              }`}
            >
              Favoritos
            </p>
          </div>
        </aside>
      ) : (
        <></>
      )}
    </>
  );
}
