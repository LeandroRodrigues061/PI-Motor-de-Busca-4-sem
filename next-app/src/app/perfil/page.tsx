"use client";
import Template from "@/components/layout/Template";
import Config from "@/components/perfil/Config";
import Favorites from "@/components/perfil/Favorites";
import {
  PerfilOptionProvider,
  usePerfilOption,
} from "@/context/PerfilOptionContext";
import { useSidebar } from "@/context/SideBarContext";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect } from "react";

export default function Perfil() {
  const { setTipo, toggleSidebar } = useSidebar();
  const {option} = usePerfilOption();
  const setUserConfigSidebar = () => setTipo("user_config");
  useEffect(() => {
    setUserConfigSidebar();
  }, []);

  useEffect(() => {
    setTipo("user_config");
  }, [setTipo]);

  return (
    <Template>
        <section className="flex flex-col p-8 gap-4">
          <div className="w-full md:hidden">
            <button
              onClick={toggleSidebar}
              className="size-10 flex items-center justify-center bg-white shadow-lg cursor-pointer rounded-full text-zinc-600"
            >
              <IconArrowLeft />
            </button>
          </div>
          {
            option === 'config' ? (
              <Config />
            )
            :
            option === 'favorites' ? (
              <Favorites />
            )
            : 
            <></>
          }
        </section>
    </Template>
  );
}
