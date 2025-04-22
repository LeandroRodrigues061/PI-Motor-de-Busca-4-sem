import Header from "./Header";

export interface templateProps{
  className?: string //tem que ter pois iremos usar classname no componente
  children: React.ReactNode //tem que ter pois iremos colocar elementos filhos dentro deste componente
}
export default function Template(props: templateProps){
  return(
  <div className="flex flex-col">
    <Header/>
    
    <main className={`w-full flex flex-col items-center justify-center ${props.className ?? ``}`}>
      {props.children}
    </main>
  </div>
  )
}