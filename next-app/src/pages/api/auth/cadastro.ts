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

  const { nome,cargo,email,password } = req.body;

  if (!nome || !cargo || !email || !password) {
    return res.status(400).json({ message: 'Um dos parametros não foram achados' });
  }

  const user = await User.insertOne({ nome,email,cargo,password });

  if (!user) {  
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  //const isPasswordValid = await user.comparePassword(password);

  return res.status(200).json({ message: 'Cadastro realizado', user: { email: user.email } });
}