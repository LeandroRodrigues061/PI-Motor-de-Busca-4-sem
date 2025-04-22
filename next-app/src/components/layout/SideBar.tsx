import { Button } from "../Button";

export default function SideBar(){
  return(
    <aside className="w-96 border-r border-zinc-200 ">
      <Button variant="primary" size="full"> Buscar </Button>
    </aside>
  )
}