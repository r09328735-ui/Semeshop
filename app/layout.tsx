import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Semeshop", template: "%s | Semeshop" },
  description: "Semeshop — votre boutique en ligne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
