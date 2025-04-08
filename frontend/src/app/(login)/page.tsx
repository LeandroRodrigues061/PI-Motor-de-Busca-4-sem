'use client'
import { IconArrowRight, IconEye, IconEyeClosed, IconLock, IconMail } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
export default function Login() {
  const [type, setType] = useState("password")
  const [isEyeOpen, setIsEyeOpen] = useState(false);

  const toggleEye = () => {
    if (isEyeOpen) {
      setType("password");
      setIsEyeOpen(false);
    } else {
      setType("text");
      setIsEyeOpen(true);
    }
  }

  return (
   <div className="w-full h-screen grid grid-cols-2 bg-white">
     <article className="flex flex-col items-center justify-center pb-40 bg-[url('/img/background-image.png')] bg-no-repeat bg-center">
       <div className="flex flex-col justify-center items-center w-[500px] text-center">
         <Image src="img/Logo.svg" alt="Logotipo" width={100} height={100} />
         <h1 className="font-semibold text-3xl mt-6">Bem-vindo ao nosso buscador de leilões!</h1>
         <p className="text-zinc-200 text-lg">Encontre imóveis com facilidade e eficiência</p>
       </div>
     </article>

     <article className="flex flex-col items-center justify-center pb-40 ">
     <form className="w-[500px] flex flex-col items-center justify-center gap-5">
        <div className="w-full flex justify-center">
          <h2 className="text-primary text-4xl font-semibold uppercase">login</h2>
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-2xl text-primary">E-mail:</label>
          <div className="w-full flex justify-start items-center gap-1 border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2">
            <IconMail className="text-zinc-400"/>
            <input type="email" placeholder="Digite seu email" className="outline-none text-zinc-500" />
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-2xl text-primary">Senha:</label>
          <div className="w-full flex justify-between items-center border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2">
            <div className="flex gap-1">
              <IconLock className="text-zinc-400"/>
              <input type={type} placeholder="Digite seu senha" className="outline-none text-zinc-500" />
            </div>

            <button type="button" onClick={toggleEye} className="outline-none cursor-pointer">
              { isEyeOpen ? <IconEye /> : <IconEyeClosed />}
            </button>
          </div>
          <span className="text-sm text-primary cursor-pointer pt-1">Esqueceu sua senha?</span>
        </div>
       
        <button type="button" className="bg-primary rounded-xl shadow-primary w-full py-4 cursor-pointer flex justify-center items-center gap-2 mt-5">
          <p className="text-xl font-semibold">Entrar</p>
          <IconArrowRight size={24}/>
        </button>
      </form>
     </article>
   </div>
  );
}
