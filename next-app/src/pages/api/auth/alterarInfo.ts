import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import User from "@/data/models/User";
import { verifyToken } from "@/middleware/authJWT";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: `Método ${req.method} não permitido.` });
  }

  const { id, nome, email, cargo, senha } = req.body;

  if (!id || !nome || !email || !cargo || !senha) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  await dbConnect();

  try {
    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    user.nome = nome;
    user.email = email;
    user.cargo = cargo;
    user.password = senha;

    // Salve as alterações no banco de dados
    await user.save();

    return res
      .status(200)
      .json({ message: "Informações atualizadas com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar informações do usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export default verifyToken(handler);
