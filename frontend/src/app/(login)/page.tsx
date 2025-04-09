"use client";
import { Button } from "@/components/Button";
import {
  IconArrowRight,
  IconEye,
  IconEyeClosed,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import users from "@/data/constants/Users";
export default function Login() {
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Senha vísivel ou invísivel
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

  // Form para login ou recupeção de senha
  const [mode, setMode] = useState("login");
  const forgotPasswordMode = () => {
    setMode("forgotPassword");
  };
  const loginMode = () => {
    setMode("login");
  };

  // Email verificado
  const [isEmailCheck, setIsEmailCheck] = useState(false);
  const emailChecked = () => {
    const userFound = users.find(user => user.email === email);
    if (userFound) {
      setIsEmailCheck(true);
    } else {
      alert("Email não encontrado no banco de dados");
    }
  };
  // Senha verificada
  const [ispasswordCheck, setIspasswordCheck] = useState(false);
  const passwordChecked = () => {
    const userFound = users.find(user => user.password === password);
    if (userFound) {
      setIspasswordCheck(true);
    } else {
      alert("password não encontrado no banco de dados");
    }
  };

  // verificar a mesma senha
  const [isSamePassword, setIsSamePassword] = useState(false);
  const checkSamePassword = () => {
    if(password === confirmPassword){
      setIsSamePassword(true)
      alert("abrir modal para voltar pro login, usar shadcn")
    }
    alert("as senhas não coincidem")
  }

  return (
    <div className="w-full h-screen grid grid-cols-2 bg-white">
      <article className="flex flex-col items-center justify-center pb-40 bg-[url('/img/background-image.png')] bg-no-repeat bg-center">
        <div className="flex flex-col justify-center items-center w-[500px] text-center">
          <Image
            onClick={loginMode}
            src="img/Logo.svg"
            alt="Logotipo"
            width={100}
            height={100}
          />
          <h1 className="font-semibold text-4xl mt-6">
            {mode === "login"
              ? "Bem-vindo ao nosso buscador de leilões!"
              : "Altere sua senha aqui"}
          </h1>
          <p className="text-zinc-200 text-lg mt-2">
            Encontre imóveis com facilidade e eficiência
          </p>
        </div>
      </article>

      <article className="flex flex-col items-center justify-center  ">
        <form className="w-[500px] flex flex-col items-center justify-center gap-5">
          <div className="w-full justify-center flex flex-col items-center gap-2">
            <h2 className="text-primary text-4xl font-semibold uppercase ">
              {mode === "login" ? "login" : "alterar senha"}
            </h2>
            <p
              className={`text-primary/70 ${
                mode === "login" ? "hidden" : "block"
              } `}
            >
              {" "}
              Informe abaixo seu email cadastrado{" "}
            </p>
          </div>

          {mode === "login" ? (
            <>
              <div className="w-full flex flex-col gap-1">
                <label className="text-2xl text-primary">E-mail:</label>
                <div className="w-full flex justify-start items-center gap-1 border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2 focus-within:border-primary ">
                  <IconMail className="text-zinc-400" />
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="outline-none text-zinc-500 "
                  />
                </div>
              </div>
              <div
                className={`w-full flex flex-col gap-1 transition-opacity duration-300`}
              >
                <label className="text-2xl text-primary">Senha:</label>
                <div className="w-full flex justify-between items-center border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2 focus-within:border-primary">
                  <div className="flex gap-1">
                    <IconLock className="text-zinc-400" />
                    <input
                      type={type}
                      placeholder="Digite seu senha"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className="outline-none text-zinc-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={toggleEye}
                    className="outline-none cursor-pointer"
                  >
                    {isEyeOpen ? <IconEye /> : <IconEyeClosed />}
                  </button>
                </div>
                <span
                  onClick={forgotPasswordMode}
                  className="text-sm text-primary cursor-pointer pt-1"
                >
                  Esqueceu sua senha?
                </span>
              </div>
              <Button type="button" variant="primary" size="full">
                <p className="text-xl font-semibold">Entrar</p>
                <IconArrowRight size={24} />
              </Button>
            </>
          ) : (
            <>
              <div className="w-full flex flex-col gap-1">
                <label className="text-2xl text-primary  ">E-mail:</label>
                <div className="w-full flex justify-start items-center gap-1 border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2 focus-within:border-primary ">
                  <IconMail className="text-zinc-400" />
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="outline-none text-zinc-500 "
                  />
                </div>
              </div>
              <div
                className={`w-full flex flex-col gap-1 transition-opacity duration-300 ${isEmailCheck === true ? "block" : "hidden"}`}
              >
                <label className="text-2xl text-primary">Nova senha:</label>
                <div className="w-full flex justify-between items-center border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2 focus-within:border-primary">
                  <div className="flex gap-1">
                    <IconLock className="text-zinc-400" />
                    <input
                      type={type}
                      placeholder="Digite sua nova senha"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className="outline-none text-zinc-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={toggleEye}
                    className="outline-none cursor-pointer"
                  >
                    {isEyeOpen ? <IconEye /> : <IconEyeClosed />}
                  </button>
                </div>
              </div>
              <div
                className={`w-full flex flex-col gap-1 transition-opacity duration-300 ${isEmailCheck === true ? "block" : "hidden"}`}
              >
                <label className="text-2xl text-primary">Confirme a senha:</label>
                <div className="w-full flex justify-between items-center border border-zinc-300 text-zinc-400 rounded-lg px-3 py-2 focus-within:border-primary">
                  <div className="flex gap-1">
                    <IconLock className="text-zinc-400" />
                    <input
                      type={type}
                      placeholder="Digite sua nova senha"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      value={confirmPassword}
                      className="outline-none text-zinc-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={toggleEye}
                    className="outline-none cursor-pointer"
                  >
                    {isEyeOpen ? <IconEye /> : <IconEyeClosed />}
                  </button>
                </div>
              </div>
             { isEmailCheck === false ?
              <Button type="button" onClick={emailChecked} variant="primary" size="full">
                <p className="text-xl font-semibold">Continuar</p>
              </Button>
              :
              <Button type="button" variant="primary" onClick={checkSamePassword} size="full">
                <p className="text-xl font-semibold">Confirmar</p>
              </Button>
            }
            </>
          )}
        </form>
      </article>
    </div>
  );
}
