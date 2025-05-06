export interface Imovel {
  id: string;
  dataLeilao: string; // formato ISO: '2025-03-31T10:30:00'
  tempoRestante: {
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
  };
  numeroImovel: string;
  valorAvaliacao: number;
  valorMinimoVenda: number;
  endereco: string;
  imagem: string; // URL da imagem
  tipoImovel: string;
  estado: string;
  cidade: string;
  bairro: string;
  banco: string;
}
