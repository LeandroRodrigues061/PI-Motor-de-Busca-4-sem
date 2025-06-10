import type { Metadata } from "next";

import "./globals.css";
import { Inter } from "next/font/google";
import { FiltroProvider } from "@/context/FilterContext";
import { SidebarProvider } from "@/context/SideBarContext";
import { AuthProvider } from "@/context/AuthContext"; 
import { PerfilOptionProvider } from "@/context/PerfilOptionContext";

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
        className={`${inter.className} antialiased`}
      >
      <AuthProvider>
        <FiltroProvider>
          <SidebarProvider>
            <PerfilOptionProvider>
              {children}
            </PerfilOptionProvider>
          </SidebarProvider>
        </FiltroProvider>  
      </AuthProvider>
      </body>
    </html>
  );
}
