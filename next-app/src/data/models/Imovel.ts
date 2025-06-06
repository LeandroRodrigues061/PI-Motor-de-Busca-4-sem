import { Schema, model, models } from 'mongoose';

export interface Imovel {
  _id:             string,
  cidade:         string,
  estado:         string,
  banco:          string,
  numero_imovel:   string, // Número do imóvel no leilão
  imagem:         string,
  link:           string,
  valor_avaliacao: number,
  tipoImovel:     string,
  endereco:       string,
  datas_leiloes: Date[], // Datas dos leilões
  valor_minimo_1_leilao: number | null, // Valor mínimo de venda no primeiro leilão
  valor_minimo_2_leilao: number | null, // Valor mínimo de venda no segundo leilão
  formas_pagamento: string[], // Formas de pagamento disponíveis

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
  valor_avaliacao: { type: Number },
  valor_minimo_1_leilao : { type: Number }, // Valor mínimo de venda no primeiro leilão
  valor_minimo_2_leilao : { type: Number }, // Valor mínimo de venda no segundo leilão
  datas_leiloes: { type: [Date] }, // Datas dos leilões
  formas_pagamento: { type: [String] }, // Formas de pagamento disponíveis
  tipoImovel: { type: String },
  endereco: { type: String },
  dataImovel: { type: Date},
  favorito: { type: Boolean }, // Indica se o imóvel é favorito
}, { collection: 'imoveis' }); // Associa explicitamente à coleção existente

// Verifica se o modelo já existe para evitar recriação durante hot reload no Next.js
const Imovel = models.Imovel || model('Imovel', ImovelSchema);

export default Imovel;