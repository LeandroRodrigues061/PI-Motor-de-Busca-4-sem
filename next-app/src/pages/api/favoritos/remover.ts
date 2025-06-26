import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import User from '@/data/models/User';
import { verifyToken } from '@/middlewares/authJWT'; 

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  await dbConnect(); // Conecta ao banco de dados

  const { userId, imovelId } = req.body;

  // Verifica se os dados necessários foram fornecidos
  if (!userId || !imovelId) {
    return res.status(400).json({ message: "Dados inválidos" });
  }

  try {
    // Busca o usuário pelo ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se o imóvel está nos favoritos
    if (!user.favoritos.includes(imovelId)) {
      return res.status(400).json({ message: "Imóvel não está nos favoritos" });
    }

    // Remove o imóvel dos favoritos
    user.favoritos = user.favoritos.filter((id) => id.toString() !== imovelId);
    await user.save();

    return res.status(200).json({ message: "Imóvel removido dos favoritos", favoritos: user.favoritos });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

export default verifyToken(handler);