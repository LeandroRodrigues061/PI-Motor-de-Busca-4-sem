import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define a interface para o objeto de usuário adicionado à requisição
interface AuthenticatedRequest extends NextApiRequest {
  user?: JwtPayload;
}

export const verifyToken = (handler: NextApiHandler) => async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET || 'BuscadorLastrearOMelhorDeSaoPaulo';

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    req.user = decoded; // Adiciona as informações decodificadas do usuário ao objeto de requisição
    return handler(req, res); // Chama o handler da rota se o token for válido
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};