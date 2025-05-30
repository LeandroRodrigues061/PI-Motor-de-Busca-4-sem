import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import Imovel from '@/data/models/Imovel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }
  try {
    await dbConnect();

    const imoveis = await Imovel.find({});

    return res.status(200).json(imoveis);
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}