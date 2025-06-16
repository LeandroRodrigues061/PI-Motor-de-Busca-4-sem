'use client'
import { IconHeart, IconLogout, IconSearch, IconUser, IconUserCircle } from "@tabler/icons-react";
import Link from "next/link";
import Logotipo from "./Logotipo";
import { useState } from "react";
import { usePerfilOption } from "@/context/PerfilOptionContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleModal = () => {
    setIsOpen(!isOpen)
  }
  const { setOption } = usePerfilOption()
  return (
   <header className="w-full flex items-center justify-center border-b border-zinc-200">
      <nav className="max-w-7xl w-full flex justify-between items-center relative">
        <Logotipo />
        <div className="flex gap-9 items-center justify-end">
          <Link href={"/buscador"} className="flex gap-1 text-zinc-600 transition-colors duration-300 hover:text-primary">
            <IconSearch />
            <p className="hidden md:flex">Buscar</p>
          </Link>
          <Link onClick={() => setOption('favorites')} href={"/perfil"} className="flex gap-1 text-zinc-600 transition-colors duration-300 hover:text-primary">
            <IconHeart />
            <p className="hidden md:flex">Favoritos</p>
          </Link>
          <button onClick={toggleModal} className="cursor-pointer flex items-center justify-center p-1 z-10">
            <IconUserCircle size={40} className="text-zinc-600 transition-colors duration-300 hover:text-primary"/>
          </button>
        </div>

        {
          isOpen &&  (
            <div className="w-28 rounded-xl p-4 border border-zinc-200 bg-white flex flex-col gap-2 mt-8 justify-center items-start absolute top-12 right-0 transition-all animate-fade-in-down ">
              <Link href={"/perfil"} className="flex gap-1 text-zinc-600 transition-colors duration-300 hover:text-primary items-center">
                <IconUser size={20} />
                <p>Perfil</p>
              </Link>
              <Link href="#" onClick={(e) => {
                e.preventDefault(); // Impede o comportamento padrão do link
                localStorage.removeItem("authToken"); // Remove o token de autenticação
                sessionStorage.clear(); // Limpa dados da sessão, se necessário
                window.location.href = "/"; // Redireciona para a página de login
              }}
              className="flex gap-1 text-zinc-600 transition-colors duration-300 hover:text-red-500 items-center">
                <IconLogout size={20} />
                <p>Logout</p>
              </Link>
            </div>
          )
        }
      </nav>
   </header>
  );
}
