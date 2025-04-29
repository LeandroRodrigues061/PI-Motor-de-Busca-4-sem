export default interface Estado {
  id: number;
  name: string;
  cidade: {
    nome: string;
    bairros: string[];
  }[];
}
