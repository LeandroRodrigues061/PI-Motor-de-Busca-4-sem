import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import Imovel from "@/data/models/Imovel";
import { verifyToken } from "@/middleware/authJWT";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }
  try {
    await dbConnect();
    const bairros = await Imovel.distinct("bairro");
    return res.status(200).json({ bairros });
  } catch (error) {
    console.error("Erro ao buscar bairros:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

export default verifyToken(handler);
