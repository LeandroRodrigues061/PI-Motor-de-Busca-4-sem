import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import User from '@/data/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  const user = await User.findOne({ email });
  console.log("acho que o email é esse: ", email)

  if (!user) {  
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const isPasswordValid = await user.comparePassword(password);

  // Gerar JWT
  const payload = {
      email: user.email,
      nome: user.nome,
    };

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Senha incorreta' });
  }

  const secretKey = process.env.JWT_SECRET || 'BuscadorLastrearOMelhorDeSaoPaulo';
  const token = jwt.sign(payload, secretKey, { expiresIn: '4h' }); 

  return res.status(200).json({ message: 'Login bem-sucedido', token, user: { email: user.email } });
}