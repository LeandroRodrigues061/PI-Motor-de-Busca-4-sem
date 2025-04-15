import {
  IconArrowRight,
  IconEye,
  IconEyeClosed,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../Button";
import Field from "./Field";

export interface authFormProps {
  mode: string;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  forgotPasswordMode: () => void;
  handleLogin: () => void;
  isEmailCheck: boolean;
  changePassword: () => void;
  emailChecked: () => void;
}

export default function AuthForm(props: authFormProps) {
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

  const {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    forgotPasswordMode,
    confirmPassword,
    handleLogin,
    isEmailCheck,
    setConfirmPassword,
    changePassword,
    emailChecked,
  } = props;

  return (
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
          <Field
            title="Senha"
            mode={mode}
            forgotPasswordMode={forgotPasswordMode}
          >
            <div className="flex flex-1 gap-1">
              <IconLock className="text-zinc-400" />
              <input
                type={type}
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
          <Button
            type="button"
            onClick={handleLogin}
            variant="primary"
            size="full"
          >
            <p className="text-xl font-semibold">{"Entrar"}</p>
            <IconArrowRight size={24} />
          </Button>
        </>
      ) : (
        <>
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
          <div className={`${isEmailCheck === true ? "block w-full" : "hidden"}`}>
            <Field
              title="Senha"
              mode={mode}
              forgotPasswordMode={forgotPasswordMode}
            >
              <div className="flex flex-1 gap-1">
                <IconLock className="text-zinc-400" />
                <input
                  type={type}
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

          <div className={`${isEmailCheck === true ? "block w-full" : "hidden"}`}>
            <Field
              title="Confirme a senha"
              mode={mode}
              forgotPasswordMode={forgotPasswordMode}
            >
              <div className="flex flex-1 gap-1">
                <IconLock className="text-zinc-400" />
                <input
                  type={type}
                  placeholder="Digite sua nova senha"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  className="outline-none text-zinc-500 flex-1"
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

          {isEmailCheck === false ? (
            <Button
              type="button"
              onClick={emailChecked}
              variant="primary"
              size="full"
            >
              <p className="text-xl font-semibold">Continuar</p>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={changePassword}
              variant="primary"
              size="full"
            >
              <p className="text-xl font-semibold">Confirmar</p>
            </Button>
          )}
        </>
      )}
    </form>
  );
}
