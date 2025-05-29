import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import Imovel from "@/data/models/Imovel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      await dbConnect();

      const { estado, cidade, bairros, tipoImovel, valor, banco } = req.body;

      const query: any = {};

      if (estado) query.estado = estado;
      if (cidade) query.cidade = cidade;
      if (bairros.length > 0) query.bairro = { $in: bairros };
      if (tipoImovel.toLowerCase() !== "indiferente") query.tipoImovel = tipoImovel;

      if (valor) {
        if (valor.startsWith("<")) {
          query.valorAvaliacao = { $lt: Number(valor.replace("<", "")) };
        } else if (valor.startsWith(">")) {
          query.valorAvaliacao = { $gt: Number(valor.replace(">", "")) };
        } else if (valor.includes("-")) {
          const [min, max] = valor.split("-").map(Number);
          query.valorAvaliacao = { $gte: min, $lte: max };
        }
      }

      if (banco.length > 0) query.banco = { $in: banco };

      const imoveis = await Imovel.find(query).exec();
      res.status(200).json(imoveis);
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      res.status(500).json({ message: "Erro ao buscar imóveis" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}