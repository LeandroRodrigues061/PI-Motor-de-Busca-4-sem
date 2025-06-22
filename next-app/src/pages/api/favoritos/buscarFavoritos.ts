import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import "@/data/models/User";    
import "@/data/models/Imovel";  
import mongoose from "mongoose";
import { verifyToken } from "@/middlewares/authJWT"; // Importa o middleware


async function handler(req: NextApiRequest, res: NextApiResponse) {


  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {    await dbConnect();

    const UserFromModel = mongoose.model('User'); 
    const ImovelFromModel = mongoose.model('Imovel'); 

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário não fornecido" });
    }

    const userDoc = await UserFromModel.findById(userId).populate("favoritos");

    if (!userDoc) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({ favoritos: userDoc.favoritos });

  } catch (error) {
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

export default verifyToken(handler);