import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import Imovel from "@/data/models/Imovel";
import { verifyToken } from "@/middleware/authJWT";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      await dbConnect();

      const { estado, cidade, bairro, tipoImovel, valor, banco } = req.body;

      if (
        !estado &&
        !cidade &&
        (!bairro || bairro.length === 0) &&
        !valor &&
        !tipoImovel &&
        (!banco || banco.length === 0)
      ) {
        return res
          .status(400)
          .json({ message: "Pelo menos um filtro deve ser fornecido." });
      }

      const query: any = {};

      if (estado) query.uf = estado;
      if (cidade) query.cidade = cidade;
      if (bairro && Array.isArray(bairro) && bairro.length > 0) {
        query.bairro = { $in: bairro };
      }
      if (tipoImovel && tipoImovel !== "indiferente")
        query.tipo_imovel = tipoImovel;

      if (valor && typeof valor === "string") {
        if (valor.startsWith("<")) {
          const num = parseFloat(valor.replace("<", ""));
          query.$expr = { $lt: [{ $toDouble: "$valor_avaliacao" }, num] };
        } else if (valor.startsWith(">")) {
          const num = parseFloat(valor.replace(">", ""));
          query.$expr = { $gt: [{ $toDouble: "$valor_avaliacao" }, num] };
        } else if (valor.includes("-")) {
          const [min, max] = valor.split("-").map(Number);
          query.$expr = {
            $and: [
              { $gte: [{ $toDouble: "$valor_avaliacao" }, min] },
              { $lte: [{ $toDouble: "$valor_avaliacao" }, max] },
            ],
          };
        }
      }

      if (banco && banco.length > 0) {
        query.banco = { $in: banco };
      }
      //console.log("BODY:", req.body);
      //console.log("QUERY:", query);

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

export default verifyToken(handler);
