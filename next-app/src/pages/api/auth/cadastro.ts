import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import User from '@/data/models/User';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { nome,cargo,email,password,confirmPassword } = req.body;

  if (!nome || !cargo || !email || !password) {
    return res.status(400).json({ message: 'Um dos parametros não foram achados' });
  }

  if(password !== confirmPassword){
    return res.status(400).json({ message: 'As senhas não coincidem' });
  }

  const usuarioExistente = await User.findOne({ email });
  if( usuarioExistente ) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }

  const user = await User.insertOne({ nome,email,cargo,password });

  if (!user) {  
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  return res.status(200).json({ message: 'Cadastro realizado', user: { email: user.email } });
}