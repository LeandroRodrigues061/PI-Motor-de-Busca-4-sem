import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import User from '@/data/models/User';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== "POST"){
    return res.status(405).json({ message: "Método não permitido" });
  }
  dbConnect();

  const { userId, imovelId } = req.body;

  if (!userId || !imovelId) {
    return res.status(400).json({ message: "Dados inválidos" });
  }

    try {
    // Busca o usuário pelo ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se o imóvel já está nos favoritos
    if (user.favoritos.includes(imovelId)) {
      return res.status(400).json({ message: "Imóvel já está nos favoritos" });
    }

    // Adiciona o imóvel aos favoritos
    user.favoritos.push(imovelId);
    await user.save();

    return res.status(200).json({ message: "Imóvel adicionado aos favoritos", favoritos: user.favoritos });
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }


}