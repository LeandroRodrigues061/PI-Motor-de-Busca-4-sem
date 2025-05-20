import { Schema, model, models } from 'mongoose';

export interface Imovel {
  _id:             string,
  cidade:         string,
  estado:         string,
  banco:          string,
  numeroImovel:   string, // Número do imóvel no leilão
  imagem:         string,
  link:           string,
  valorAvaliacao: string,
  tipoImovel:     string,
  endereco:       string,
  // valorAvaliacao: number;
  // tempoRestante: {
  //   dias: number;
  //   horas: number;
  //   minutos: number;
  //   segundos: number;
  // }
}

const ImovelSchema = new Schema({
  id: { type: String },
  cidade: { type: String },
  estado: { type: String },
  banco: { type: String },
  numeroImovel: { type: String }, // Número do imóvel no leilão
  imagem: { type: String },
  link  : { type: String },
  valorAvaliacao: { type: Number },
  tipoImovel: { type: String },
  endereco: { type: String },
}, { collection: 'imoveis_caixa' }); // Associa explicitamente à coleção existente

// Verifica se o modelo já existe para evitar recriação durante hot reload no Next.js
const Imovel = models.Imovel || model('Imovel', ImovelSchema);

export default Imovel;