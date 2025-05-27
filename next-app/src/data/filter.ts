import { dbConnect } from "@/lib/mongodb";
import  Imovel  from "@/data/models/Imovel";

// Função para buscar imóveis do banco de dados com base nos filtros
export async function getImoveisFromDatabase(filtros: any) {
  await dbConnect(); // Garante que o banco está conectado

  const query: any = {};

  if (filtros.estado) {
    query.estado = filtros.estado;
  }

  if (filtros.cidade) {
    query.cidade = filtros.cidade;
  }

  // if (filtros.bairros.length > 0) {
  //   query.bairro = { $in: filtros.bairros };
  // }

  if (filtros.tipoImovel.toLowerCase() !== "indiferente") {
    query.tipoImovel = filtros.tipoImovel;
  }

  if (filtros.valor) {
    const valorStr = filtros.valor;

    if (valorStr.startsWith("<")) {
      const limite = Number(valorStr.replace("<", ""));
      query.valorAvaliacao = { $lt: limite };
    } else if (valorStr.startsWith(">")) {
      const limite = Number(valorStr.replace(">", ""));
      query.valorAvaliacao = { $gt: limite };
    } else if (valorStr.includes("-")) {
      const [min, max] = valorStr.split("-").map(Number);
      query.valorAvaliacao = { $gte: min, $lte: max };
    }
  }

  if (filtros.banco.length > 0) {
    query.banco = { $in: filtros.banco };
  }

  const imoveis = await Imovel.find(query).exec();
  return imoveis;
}