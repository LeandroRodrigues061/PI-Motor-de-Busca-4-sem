'use client'
import { useState } from "react"
import { useAuth } from "@/context/AuthContext" 

export default function SideBarUserConfig() {
  const { user } = useAuth() 
  const [option, setOption] = useState("favoritos")
  const modeFavorite = () => setOption("favoritos")
  
  return(
    <aside className="w-[340px] min-h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 ">
      <h2 className="text-zinc-500 font-semibold">
        Aqui é o seu perfil
      </h2>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-zinc-900 text-2xl font-semibold">{user?.nome}</h1>
        <p className="text-zinc-600">{user?.cargo}</p>
      </div>

      <span className="w-full h-[0.5px] my-3 rounded-2xl bg-zinc-300"></span>

      <div className={`w-full p-4 rounded-xl cursor-pointer ${option === 'favoritos' ? "bg-[#BFDBFE]" : ""}`}>
        <p className={`text-xl  font-semibold hover:text-primary transition-colors duration-300 ${option === 'favoritos' ? "text-primary" : "text-zinc-600 " }`}>Favoritos</p>
      </div>
    </aside>
  )
}