import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "../Button";
import Image from "next/image";
export interface modalFormProps{
  back: () => void;
  closeModal: () => void;
}
export default function ModalForm(props: modalFormProps) {
  const { back, closeModal } = props;
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-[100]">
      <div className="w-96 rounded-xl bg-white border border-zinc-400 p-10 flex flex-col gap-6">
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex items-center justify-center">
            <Image src="./public/img/check.svg" alt="icone de check" width={40} height={40}/>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900">
            Senha trocada com sucesso!
          </h3>
          <p className="text-zinc-700">
            Volte para a tela de login e acesse ao buscador Lastrear.
          </p>
        </div>
        <div className="w-full">
          <Button
            variant="primary"
            size="full"
            onClick={() => {
              back(), closeModal();
            }}
          >
            <IconArrowLeft />
            <p className="font-semibold">Voltar ao login</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
