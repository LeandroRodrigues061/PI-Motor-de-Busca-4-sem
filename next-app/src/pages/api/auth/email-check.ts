import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import User from '@/data/models/User';
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Conectar ao MongoDB
  await dbConnect();

  // Verifica se o método da requisição é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Extrai o email da requisição
  const { email } = req.body;

  // Valida se o email foi fornecido
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório' });
  }

  try {
    // Tenta encontrar o usuário com o email fornecido
    const user = await User.findOne({ email });

    // Se o usuário não for encontrado, retorna erro
    if (!user) {
      return res.status(404).json({ message: 'Email não encontrado no banco de dados!' });
    }

    // Caso o email seja encontrado, retorna sucesso
    return res.status(200).json({ message: 'Email encontrado no banco de dados!' });

  } catch (error) {
    // Se ocorrer um erro durante a consulta ao banco de dados
    console.error(error);
    return res.status(500).json({ message: 'Erro ao verificar o email no banco de dados' });
  }
}
