"use client";
import { IconArrowLeft } from "@tabler/icons-react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/login/AuthForm";
import ModalForm from "@/components/login/ModalForm";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '@/context/AuthContext'; 

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailCheck, setIsEmailCheck] = useState(false);
  const [mode, setMode] = useState("login");
  const { signIn } = useAuth();

  const forgotPasswordMode = () => {
    setMode("forgotPassword");
  };
  const loginMode = () => {
    setMode("login");
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        signIn(data.token); 
        toast.success(data.message || "Login realizado com sucesso!"); 
        return router.push("/buscador");
      }
      toast.error(data.message || "Erro no login");
    } catch (error) {
      console.error(error);
    }
  };

  const checkEmail = async () => {
    try {
      const res = await fetch("/api/auth/email-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message || "Erro ao verificar o email");
      }
      setIsEmailCheck(true);
      toast.success("Email encontrado no banco de dados!");
    } catch (error) {
      toast.error("Erro na comunicação com o servidor.");
      console.error(error);
    }
  };

  // mudar senha
  const [isPasswordChecked, setIsPasswordChecked] = useState(false);

  const changePassword = async () => {
    try {
      const res = await fetch("/api/auth/alterarSenha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message || "Erro ao alterar a senha");
      }
      toast.success(data.message || "Senha alterada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao tentar alterar a senha");
    }
    setIsPasswordChecked(true);
  };

  const back = () => {
    setMode("login");
  };
  const closeModal = () => {
    setIsPasswordChecked(false);
  };
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
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
