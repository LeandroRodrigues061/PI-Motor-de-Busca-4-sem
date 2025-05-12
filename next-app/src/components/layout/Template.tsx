"use client"
import Header from "./Header";
import SideBar from "../SideBar";
import { VLibrasPlugin } from "@/data/hooks/VLibrasPLugin";
export interface templateProps {
  className?: string; //tem que ter pois iremos usar classname no componente
  children: React.ReactNode; //tem que ter pois iremos colocar elementos filhos dentro deste componente
}
export default function Template(props: templateProps) {

  return (
    <>
      <div className="flex flex-col overflow-x-hidden h-full">
        <Header />
        <main
          className={`w-full flex items-start justify-start gap-4 h-full ${
            props.className ?? ``
          }`}
        >
          <SideBar />
          {props.children}
        </main>
      </div>
      <VLibrasPlugin />
    </>
  );
}
