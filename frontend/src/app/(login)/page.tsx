"use client";
import { IconArrowLeft } from "@tabler/icons-react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { useState } from "react";
import users from "@/data/constants/Users";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/login/AuthForm";
import ModalForm from "@/components/login/ModalForm";
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form para login ou recupeção de senha
  const [mode, setMode] = useState("login");

  const forgotPasswordMode = () => {
    setMode("forgotPassword");
  };
  const loginMode = () => {
    setMode("login");
  };

  // Login
  const handleLogin = () => {
    const userFound = users.find(
      (user) => user.email === email && user.password === password
    );
    if (!userFound) {
      alert("email ou senha incorretos");
      return;
    }
    router.push("/buscador");
  };

  // Email existente? para liberar campos de nova senha
  const [isEmailCheck, setIsEmailCheck] = useState(false);

  const emailChecked = () => {
    const userFound = users.find((user) => user.email === email);
    if (!userFound) {
      alert("Email não encontrado no banco de dados");
      return;
    }
    setIsEmailCheck(true);
  };

  // mudar senha
  const [isPasswordChecked, setIsPasswordChecked] = useState(false);

  const changePassword = () => {
    if (password !== confirmPassword) {
      alert("As senhas não coincidem, tente novamente!");
      return;
    }
    setIsPasswordChecked(true);
    // IMPLEMENTAÇÃO DO BACKEND
  };

  // Voltar para login mode
  const back = () => {
    setMode("login");
  };
  // fechar modal
  const closeModal = () => {
    setIsPasswordChecked(false);
  };
  return (
    <>
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
            <h1 className="text-white font-semibold text-4xl mt-6">
              {mode === "login"
                ? "Bem-vindo ao nosso buscador de leilões!"
                : "Altere sua senha aqui"}
            </h1>
            <p className="text-zinc-200 text-lg mt-2">
              Encontre imóveis com facilidade e eficiência
            </p>
          </div>
        </article>

        <article
          className={`flex flex-col items-center justify-center gap-6 ${
            mode === "login" ? " " : "pb-40"
          }`}
        >
          <div
            className={`${
              mode === "login"
                ? "hidden"
                : "w-full flex items-center justify-start px-10"
            }`}
          >
            <button
              onClick={back}
              type="button"
              className="text-zinc-500 hover:text-zinc-600 flex items-center gap-2 cursor-pointer transition-colors duration-20 pt-10"
            >
              <IconArrowLeft />
              <p className="">Voltar</p>
            </button>
          </div>
          <AuthForm
            mode={mode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            forgotPasswordMode={forgotPasswordMode}
            handleLogin={handleLogin}
            isEmailCheck={isEmailCheck}
            emailChecked={emailChecked}
            changePassword={changePassword}
          />
        </article>
      </div>

      {isPasswordChecked &&
        ReactDOM.createPortal(
          <ModalForm back={back} closeModal={closeModal} />,
          document.body
        )}
    </>
  );
}
