import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import FaviconHead from "@/components/FaviconHead";
import AdminInitializer from "@/components/AdminInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoEcoli - Plateforme unifiée pour auto-écoles",
  description: "Trouvez l'auto-école parfaite près de chez vous et gérez votre auto-école en ligne",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <FaviconHead />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminInitializer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
