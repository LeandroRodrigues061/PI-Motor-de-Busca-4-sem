'use client'
import { useSidebar } from "@/context/SideBarContext"
import { useEffect } from "react"

export default function Perfil() {
  const { setTipo } = useSidebar()
  const setUserConfigSidebar = () => setTipo("user_config")
  useEffect(() => {
    setUserConfigSidebar()
  }, [])
  return(
    <aside className="w-[340px] min-h-screen border-r border-zinc-200 p-8 flex flex-col gap-4 ">
      <h2 className="text-zinc-500 font-semibold">
        Aqui é o seu perfil
      </h2>
    </aside>
  )
}