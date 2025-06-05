import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns:[
      {
        protocol: "https",
        hostname: "venda-imoveis.caixa.gov.br",
        pathname: "/fotos/**"
      },
      {
        protocol: "https",
        hostname: "www.santanderimoveis.com.br",
        pathname: "/wp-content/uploads/**", // Corrigido para refletir o caminho real
      },
    ]
  }
};

export default nextConfig;