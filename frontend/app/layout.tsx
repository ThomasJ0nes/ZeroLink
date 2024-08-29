import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3AuthProvider } from "@/context/Web3AuthContext";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZeroLink App",
  description: "Your decentralized application",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body className={inter.className}>
      <Web3AuthProvider>
        {children}
      </Web3AuthProvider>
      </body>
      </html>
  );
}
