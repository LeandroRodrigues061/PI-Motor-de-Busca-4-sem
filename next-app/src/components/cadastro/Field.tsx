
import { ReactNode } from "react";
export interface fieldProps{
  title: string
  children: ReactNode
}

export default function Field(props: fieldProps){
  const {children, title} = props
  return(
    <div className="w-full flex flex-col gap-1">
      <label className="text-2xl text-primary">{title}</label>
      <div className="w-full flex justify-start items-center gap-1 border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2 focus-within:border-primary focus-within:shadow-[0_0_4px_1px_#98C6FF] ">
       {children}
      </div>
    </div>
  )
}