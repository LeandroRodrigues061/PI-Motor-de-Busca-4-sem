import { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongodb";
import User from "@/data/models/User";

export default async function handler(req: NextApiRequest,res: NextApiResponse) {

  if (req.method !== "POST") {
    res.status(405).json({ message: `Método ${req.method} não permitido.` });
  }

  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    if(password !== confirmPassword) {
      return res.status(400).json({ message: "As senhas não coincidem." });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
}
