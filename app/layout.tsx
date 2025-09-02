import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Providers } from '@/components/providers'
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-merriweather',
})

export const metadata: Metadata = {
  title: "AdvocIA 2.0",
  description: "Sistema Jurídico Inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans antialiased bg-white dark:bg-navy-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}