import { NextApiRequest, NextApiResponse } from "next";
import { getImoveisFromDatabase } from "@/data/filter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const filtros = req.body;

    try {
      const imoveis = await getImoveisFromDatabase(filtros); // Função que aplica os filtros no banco
      res.status(200).json(imoveis);
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      res.status(500).json({ error: "Erro ao buscar imóveis" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}