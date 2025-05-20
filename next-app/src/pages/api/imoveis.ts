import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/mongodb';
import Imovel from '@/data/models/Imovel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }
  try {
    // Conecta ao banco de dados
    await dbConnect();

    // Busca todos os documentos da coleção usando o modelo do Mongoose
    const imoveis = await Imovel.find({});

    // Retorna os documentos encontrados
    return res.status(200).json(imoveis);
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}