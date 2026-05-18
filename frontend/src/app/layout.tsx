import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AGORA-glass | Sentinel",
  description: "Autonomous Liquidation Protection Terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetBrainsMono.variable} font-sans bg-[#0B0E14] text-[#F2F2F2]`}>
        <header className="flex justify-between items-center p-6 border-b border-[#1E2532] sticky top-0 bg-[#0B0E14]/80 backdrop-blur-sm z-50">
          <div className='flex items-center gap-8'>
            <h1 className="text-xl font-bold tracking-tight">AGORA-glass</h1>
            <Navigation />
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#8A93A3] uppercase">Unified Balance</p>
            <p className="text-xl font-bold text-[#00A3FF]">$12,450.00</p>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
