"use client";

import { useSidebar } from "@/context/SideBarContext";
import SidebarFilters from "./buscador/SideBarFilters";
import SideBarUserConfig from "./perfil/SideBarUserConfig";

export default function Sidebar() {
  const {tipo, setTipo } = useSidebar()
  
  switch(tipo){
    case 'filter':
      return <SidebarFilters />
    case 'user_config':
      return <SideBarUserConfig />
  }
}
