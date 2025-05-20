'use client'
import { Button } from "@/components/Button";
import Field from "@/components/cadastro/Field";
import { IconArrowRight, IconBriefcase, IconEye, IconEyeClosed, IconLock, IconUser, IconWallet } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Cadastro(){
  const router = useRouter();
  const [nome, setNome] = useState("")
  const [cargo, setCargo] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [type, setType] = useState("password");
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const toggleEye = () => {
    if (isEyeOpen) {
      setType("password");
      setIsEyeOpen(false);
    } else {
      setType("text");
      setIsEyeOpen(true);
    }
  };
  const handleRegister = () => {
      if(password !== confirmPassword) 
        return toast.error("As senhas não coincidem, tente novamente!");

      toast.success("Cadastro realizado com sucesso ")
      router.push("/");
  }

  return(
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full h-screen grid grid-cols-2 bg-white">
        <article className="flex flex-col items-center justify-center gap-6">
          <form className="w-[500px] flex flex-col items-center justify-center gap-5">
            <div className="w-full justify-center flex flex-col items-center gap-2">
              <h2 className="text-primary text-4xl font-semibold uppercase ">Cadastro</h2>
            </div>
            <Field title="Nome">
              <IconUser />
              <input
                type="text"
                placeholder="Digite seu nome"
                onChange={(e) => setNome(e.target.value)}
                value={nome}
                className="outline-none text-zinc-500 w-full"
              />
            </Field>

            <Field title="Cargo">
              <IconBriefcase />
              <input
                type="text"
                placeholder="Digite seu cargo"
                onChange={(e) => setCargo(e.target.value)}
                value={cargo}
                className="outline-none text-zinc-500 w-full"
              />
            </Field>

            <Field title="Email">
              <IconBriefcase />
              <input
                type="email"
                placeholder="Digite seu email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="outline-none text-zinc-500 w-full"
              />
            </Field>

            <Field title="Senha">
              <div className="flex flex-1 gap-1">
                <IconLock/>
                <input
                  type={type}
                  placeholder="Digite sua senha"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="outline-none text-zinc-500 w-full"
                />
              </div>
              <button
                type="button"
                onClick={toggleEye}
                className="outline-none cursor-pointer"
              >
                {isEyeOpen ? <IconEye /> : <IconEyeClosed />}
              </button>
            </Field>

            <Field title="Confirmar Senha">
              <div className="flex flex-1 gap-1 ">
                <IconLock/>
                <input
                  type={type}
                  placeholder="Confirme sua senha"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  className="outline-none text-zinc-500 w-full"
                />
              </div>
              <button
                type="button"
                onClick={toggleEye}
                className="outline-none cursor-pointer"
              >
                {isEyeOpen ? <IconEye /> : <IconEyeClosed />}
              </button>
            </Field>

            <Button
                type="button"
                onClick={handleRegister}
                variant="primary"
                size="full"
              >
                <p className="text-xl font-semibold">{"Cadastrar"}</p>
            </Button>

            <div className="w-full flex justify-start">
              <p className="text-sm text-zinc-600">
                Já possui uma conta?
                <Link href={"/"}>
                  <span className="text-primary cursor-pointer"> Login </span>
                </Link>
              </p>
            </div>
            
          </form>
        </article>
        
        <article className="flex flex-col items-center justify-center pb-40 bg-[url('/img/background-register.png')] bg-no-repeat bg-center">
          <div className="flex flex-col justify-center items-center w-[500px] text-center">
            <Image
              src="img/Logo.svg"
              alt="Logotipo"
              width={100}
              height={100}
            />
            <h1 className="text-white font-semibold text-4xl mt-6">
              <p>Bem-vindo ao nosso buscador de leilões!</p>
            </h1>
            <p className="text-zinc-200 text-lg mt-2">
              Encontre imóveis com facilidade e eficiência
            </p>
          </div>
        </article>
      </div>
    </>
  )
}