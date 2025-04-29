import Image from "next/image";
import Link from "next/link";

export default function Logotipo() {
  return(
    <Link href={"/buscador"}>
       <Image src="../../img/Logo.svg" alt="logotipo" width={80} height={80}/>
    </Link>
  )
}