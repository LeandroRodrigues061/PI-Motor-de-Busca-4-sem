import Estado from "../models/Estado";

const estados: Estado[] = [
  {
    id: 1,
    name: "SP",
    cidade: [
      {
        nome: "São Paulo",
        bairros: ["Mooca", "Itaquera", "Pinheiros", "Tatuapé", "Vila Mariana", "Liberdade"]
      },
      {
        nome: "Campinas",
        bairros: ["Cambuí", "Barão Geraldo", "Taquaral", "Sousas"]
      },
      {
        nome: "Santos",
        bairros: ["Gonzaga", "Aparecida", "Embaré", "Ponta da Praia"]
      },
      {
        nome: "São Bernardo do Campo",
        bairros: ["Rudge Ramos", "Assunção", "Centro", "Paulicéia"]
      },
      {
        nome: "Osasco",
        bairros: ["Centro", "Presidente Altino", "Rochdale", "Quitaúna"]
      },
      {
        nome: "Guarulhos",
        bairros: ["Centro", "Picanço", "Vila Augusta", "Jardim Tranquilidade"]
      },
      {
        nome: "Ribeirão Preto",
        bairros: ["Centro", "Jardim Paulista", "Campos Elíseos", "Vila Tibério"]
      }
    ]
  },
];
export default estados