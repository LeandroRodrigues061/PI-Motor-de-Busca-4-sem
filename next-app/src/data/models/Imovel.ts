import { Schema, model, models } from 'mongoose';

export interface Imovel {
  _id: string;
  dataLeilao: string; // formato ISO: '2025-03-31T10:30:00'
  estado: string;
  cidade: string;
  tipoImovel: string;
  endereco: string;
  faixaValor: string;
  banco: string;
  numeroImovel: string; // Número do imóvel no leilão
  valorMinimoVenda: number; // Valor mínimo de venda
  imagem: string;
  valorAvaliacao: number;
  tempoRestante: {
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
  }
}

const ImovelSchema = new Schema({
  id: { type: String },
  dataLeilao: { type: String },
  estado: { type: String },
  cidade: { type: String },
  tipoImovel: { type: String },
  endereco: { type: String },
  faixaValor: { type: String },
  banco: { type: String },
  valorAvaliacao: { type: Number },
}, { collection: 'imoveis_santander' }); // Associa explicitamente à coleção existente

// Verifica se o modelo já existe para evitar recriação durante hot reload no Next.js
const Imovel = models.Imovel || model('Imovel', ImovelSchema);

export default Imovel;