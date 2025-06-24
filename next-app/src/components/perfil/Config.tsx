"use client";
import { Button } from "@/components/Button";
import Field from "@/components/login/Field";
import { useAuth } from "@/context/AuthContext";
import {IconEye,IconEyeClosed,IconLock,IconMail,} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import toast, {Toaster}from "react-hot-toast";
import { parseCookies } from "nookies"; 

export default function Config() {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.nome);
  const [cargo, setCargo] = useState(user?.cargo);
  const [email, setEmail] = useState(user?.email);
  const [password, setPassword] = useState("*****");

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

  const handleSave = async () => {
    try {
      const cookies = parseCookies(); // Recupera os cookies
      const token = cookies['auth.token']; // Obtém o token dos cookies
      const response = await fetch("/api/auth/alterarInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          id: user?.id, // Certifique-se de que o ID do usuário está disponível
          nome,
          cargo,
          email,
          senha: password,
        }),
      });
      if (response.ok) {
        toast.success("Informações atualizadas com sucesso!");
      } else {
        const errorData = await response.json();
        toast.error(`Erro ao atualizar informações: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast.error("Ocorreu um erro ao salvar as alterações.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex gap-2 items-center">
        <div className="w-1 h-6 bg-primary rounded-lg" />
        <h1 className="text-3xl font-semibold text-zinc-900">
          Seja Bem vindo!
        </h1>
      </div>
      <p className="text-zinc-500 ">
        Aqui você pode acessar sua informações ou editá-las se preferir!
      </p>

      <div className="w-full h-[0.5px] bg-zinc-300 rounded-xl" />

      <article className="w-full flex flex-col">
        <div className="flex flex-col gap-3">
          <h2 className="text-zinc-500 font-semibold text-xl">Meus dados</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="rounded-full relative size-[120px] overflow-hidden">
              <Image
                src={"/img/user-generico.jpg"}
                alt="imagem do goku"
                fill
                className="object-cover"
              />
            </div>
            <Button variant="secondary">Editar foto</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            <Field title="Nome">
              <IconMail className="text-zinc-400" />
              <input
                type="text"
                placeholder={user?.nome}
                onChange={(e) => setNome(e.target.value)}
                value={nome}
                className="outline-none text-zinc-500 w-full"
              />
            </Field>
            <Field title="Cargo">
              <IconMail className="text-zinc-400" />
              <input
                type="text"
                placeholder="Digite seu cargo"
                onChange={(e) => setCargo(e.target.value)}
                value={cargo}
                className="outline-none text-zinc-500 w-full"
              />
            </Field>
            <Field title="Email">
              <IconMail className="text-zinc-400" />
              <input
                type="email"
                placeholder="Digite seu email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="outline-none text-zinc-500 w-full"
              />
            </Field>
            <Field title="Senha" setEmail={setEmail} setPassword={setPassword}>
              <div className="flex flex-1 gap-1">
                <IconLock className="text-zinc-400" />
                <input
                  type='password'
                  placeholder="Digite seu senha"
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
          </div>
          <Button onClick={handleSave} variant="primary" className="">
            Salvar alterações
          </Button>
        </div>
      </article>
    </div>
  );
}
