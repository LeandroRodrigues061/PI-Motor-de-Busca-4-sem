import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import User from '@/data/models/User';
import bcrypt from 'bcryptjs';
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

  //const isPasswordValid = await user.comparePassword(password);
  const isPasswordValid = await User.findOne({ email, password }).then((user) => {
    if (user) {
      return true;
    } else {
      return false;
    }
  } );

      // Gerar JWT
  const payload = {
      userId: user._id,
      email: user.email,
        // Adicione outras informações não sensíveis do usuário aqui
    };

  // if (!isPasswordValid) {
  //   return res.status(401).json({ message: 'Senha incorreta' });
  // }

  const secretKey = process.env.JWT_SECRET || 'BuscadorLastrearOMelhorDeSaoPaulo'; // Use uma variável de ambiente!
  const token = jwt.sign(payload, secretKey, { expiresIn: '4h' }); // Token expira em 1 hora

  console.log("Token gerado:", token); // Para verificar se o token está sendo gerado

  return res.status(200).json({ message: 'Login bem-sucedido', token, user: { email: user.email } });
}