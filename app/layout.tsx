import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Importe o componente (ajuste o caminho se necessário)
import SinoNotificacao from "@/components/SinoNotificacao"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maluma Shoes - Sistema de Estoque",
  description: "Gerenciamento inteligente de calçados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 2. Coloque o Sino aqui. 
            Ele tem "position: fixed", então ficará parado no canto da tela 
            independente de onde o usuário navegar. */}
        <SinoNotificacao />
        
        {children}
      </body>
    </html>
  );
}