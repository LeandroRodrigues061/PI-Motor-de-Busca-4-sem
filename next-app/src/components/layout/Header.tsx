'use client'
import { IconHeart, IconSearch, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import Logotipo from "./Logotipo";
import { useState } from "react";

export default function Header() {
  const option = [
    {
      link: "/perfil",
      label: "Perfil",
  
    },
    {
      link: "/logout",
      label: "Logout",
    },
  ]

  const [isOpen, setIsOpen] = useState(false)

  const toggleModal = () => {
    setIsOpen(!isOpen)
  }
  return (
   <header className="w-full flex items-center justify-center border-b border-zinc-200">
      <nav className="max-w-7xl w-full flex justify-between items-center relative">
        <Logotipo />
        <div className="flex gap-9 items-center justify-end">
          <Link href={"/buscador"} className="flex gap-1 text-zinc-600">
            <IconSearch />
            <p>Buscar</p>
          </Link>
          <Link href={"/favoritos"} className="flex gap-1 text-zinc-600">
            <IconHeart />
            <p>Favoritos</p>
          </Link>
          <button onClick={toggleModal} className="size-12 flex items-center justify-center bg-zinc-300 rounded-full cursor-pointer">
            <IconUser />
          </button>
        </div>

        {
          isOpen &&  (
            <div className="w-28 rounded-xl p-4 bg-zinc-200 flex flex-col gap-2 mt-8 justify-center absolute top-10 right-0">
                {
                  option.map((option) => (
                    <Link key={option.link} href={option.link} className="text-zinc-700 hover:text-zinc-800"> {option.label}</Link>
                  ))
                }
            </div>
          )
        }
      </nav>
   </header>
  );
}
