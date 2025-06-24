import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
        pathname: "/wp-content/uploads/**", 
      },
      {
        protocol: "https",
        hostname: "cdn1.megaleiloes.com.br",
        pathname: "/batches/**"
      },
      {
        protocol: "https",
        hostname: "imagens.portalzuk.com.br",
        pathname: "/detalhe/**"
      },
      {
        protocol: "https",
        hostname: "cdn.frazaoleiloes.com.br",
        pathname: "/images/**"
      },
      {
        protocol: "https",
        hostname: "cdn-biasi.blueintra.com",
        pathname: "/images/**"
      },
      {
        protocol: "https",
        hostname: "www.itau.com.br",
        pathname: "/media/**" 
      },
      {
        protocol: "https",
        hostname: "images.vitrinebradesco.com.br",
        pathname: "/**"
      },
    ]
  }
};

export default nextConfig;