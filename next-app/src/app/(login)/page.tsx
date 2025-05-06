"use client";
import { IconArrowLeft } from "@tabler/icons-react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/login/AuthForm";
import ModalForm from "@/components/login/ModalForm";
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailCheck, setIsEmailCheck] = useState(false);
  // Form para login ou recupeção de senha
  const [mode, setMode] = useState("login");

  const forgotPasswordMode = () => {
    setMode("forgotPassword");
  };
  const loginMode = () => {
    setMode("login");
  };

  // Login
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        return toast.error(data.message || 'Erro no login');
      }
      toast.success('Login realizado com sucesso!');
      router.push('/buscador');
    } catch (error) {
      toast.error('Erro ao conectar com o servidor.');
      console.error(error);
    }
  };

  // Email existente? para liberar campos de nova senha

  const checkEmail = async () => {
    try {
      const res = await fetch('/api/auth/email-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message || 'Erro ao verificar o email');
      }

      // Se email for encontrado, faz algo (exemplo: habilita a verificação da senha)
      setIsEmailCheck(true);
      toast.success('Email encontrado no banco de dados!');
    } catch (error) {
      toast.error('Erro na comunicação com o servidor.');
      console.error(error);
    }
  };

  // mudar senha
  const [isPasswordChecked, setIsPasswordChecked] = useState(false);

  const changePassword = () => {
    if (password !== confirmPassword) {
      return toast.error('As senhas não coincidem, tente novamente!');
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
      <Toaster position="top-right" reverseOrder={false} />
      <div   className="w-full h-screen grid grid-cols-2 bg-white">
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
              onClick={handleLogin}
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
            emailChecked={checkEmail}
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
