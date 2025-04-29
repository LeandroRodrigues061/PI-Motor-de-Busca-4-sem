import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"]})

export const metadata: Metadata = {
  title: "Buscador Lastrear",
  description: "Motor de busca da Lastrear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.className}} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
