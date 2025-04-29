// export default function Buscador(){
//   return(
//     <section className="flex flex-col p-8 gap-4">
//           <div className="flex gap-1 items-center">
//             <div className="w-1 h-6 bg-primary"/>
//             <h1 className="text-3xl font-semibold text-zinc-900">Buscador</h1>
//           </div>
//           <div className="flex items-center gap-8">
//             <button onClick={filter1} className={`px-8 py-2  hover:text-primary font-semibold transition-all durantion-300  border rounded-xl cursor-pointer ${filter === 1 ? "border-primary text-primary" : " border-zinc-300 text-zinc-500"} `}>
//               <p>Recentes</p>
//             </button>
//             <button onClick={() => {filter2(), toggleCrescente()}} className={`px-8 py-2  hover:text-primary font-semibold transition-all durantion-300  border rounded-xl cursor-pointer flex gap-1 justify-center items-center ${filter === 2 ? "border-primary text-primary" : " border-zinc-300 text-zinc-500"} `}>
//               <p>Valores</p>
//               {
//                 crescente ? <IconArrowUp/> : <IconArrowDown/>
//               }
//             </button>
//             <button onClick={filter3} className={`px-8 py-2  hover:text-primary font-semibold transition-all durantion-300  border rounded-xl cursor-pointer flex gap-1 justify-center items-center ${filter === 3 ? "border-primary text-primary" : " border-zinc-300 text-zinc-500"} `}>
//               <p>Encerrando</p>
//               <IconClock />
//             </button>
          
//           </div>
//           <div className="w-[850px] h-[0.5px] bg-zinc-300 rounded-2xl my-2"/>
//           <p className="text-zinc-500"> Foram encontrados <span className="font-semibold">{imoveisFiltrados.length}</span> imóveis</p>
//           <div className="p-8 flex flex-col gap-4">
//           {imoveisFiltrados.map((imovel) => (
//             <div key={imovel.id} className="border border-zinc-300 p-6 rounded-xl bg-white justify-between items-start w-[850px] flex gap-6">
//               <div className="relative rounded-xl w-72 h-52">
//                 <Image src={imovel.imagem} alt="imagem da casa" fill className="object-cover"/>
//               </div>
//               <div className="flex flex-col gap-[6px] w-full">
//                 <div className="flex gap-1 items-center">
//                   <p className="text-zinc-600">Tempo restante:</p>
//                   <div className="bg-secondary px-5 py-1 rounded-xl">
//                     <p className="text-white font-semibold">{imovel.tempoRestante.dias} dias</p>
//                   </div>
//                   <div className="bg-secondary px-5 py-1 rounded-xl">
//                     <p className="text-white font-semibold">{imovel.tempoRestante.horas} horas</p>
//                   </div>
//                   <div className="bg-secondary px-5 py-1 rounded-xl">
//                     <p className="text-white font-semibold">{imovel.tempoRestante.minutos} min</p>
//                   </div>
//                   <div className="bg-secondary px-5 py-1 rounded-xl">
//                     <p className="text-white font-semibold">{imovel.tempoRestante.segundos} seg</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-1">
//                   <p className="text-zinc-600">Data do leilão:</p>
//                   <p className="text-zinc-800 font-semibold">{imovel.dataLeilao}</p>
//                 </div>
//                 <div className="flex gap-1">
//                   <p className="text-zinc-600">Número do imóvel:</p>
//                   <p className="text-zinc-800 font-semibold">{imovel.numeroImovel}</p>
//                 </div>
//                 <div className="flex gap-1">
//                   <p className="text-zinc-600">Valor de avaliação:</p>
//                   <p className="text-zinc-800 font-semibold">{imovel.valorAvaliacao}</p>
//                 </div>
//                 <div className="flex gap-1">
//                   <p className="text-zinc-600">Valor de avaliação:</p>
//                   <p className="text-zinc-800 font-semibold">{imovel.valorMinimoVenda}</p>
//                 </div>
//                 <div className="flex gap-1">
//                   <p className="text-zinc-600">Valor de avaliação:</p>
//                   <p className="text-zinc-800 font-semibold">{imovel.endereco}</p>
//                 </div>
//                 <Button variant="primary" size="default" > Veja no site do leilão </Button>
//               </div>
//               <IconHeart size={40} />
//              {/* <button onClick={toggleFavorite}>
//                { isFavorite ?
//                 <IconHeart size={30} className="bg-red-500"/> : <IconHeart size={30} />
//                 }
//              </button> */}
//             </div>
//               ))}
//             </div>
//           {/* {props.children } */}
//         </section>
//   )
// }