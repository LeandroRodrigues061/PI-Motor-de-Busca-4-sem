import Image from "next/image";
export default function Login() {
  return (
   <div className="w-full h-screen grid grid-cols-2 ">
     <article className="flex items-center justify-center bg-[url('/img/background-image.png')] bg-no-repeat bg-center flex-col">
       <Image src="img/Logo.svg" alt="Logotipo" width={100} height={100} />
       <h1 className="font-semibold text-2xl">Bem-vindo ao nosso buscador de leilões!</h1>
       <p className="text-zinc-200">Encontre imóveis com facilidade e eficiência</p>
     </article>

     <article>
      <p>aaaa</p>
     </article>
   </div>
  );
}
