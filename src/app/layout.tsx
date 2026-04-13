import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dimension Energy | Tu mejor precio, sin cambios",
  description:
    "Garantizamos que tendrás el mejor precio sin brincar de una compañía a otra. Sin letras pequeñas, sin permanencia y con gestión 100% personalizada para ti.",
  keywords: [
    "Dimension Energy",
    "energía",
    "electricidad",
    "GBP Energía",
    "ahorro",
    "tarifa eléctrica",
    "perfilado de precios",
  ],
  authors: [{ name: "Dimension Energy" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Dimension Energy | Tu mejor precio, sin cambios",
    description:
      "Garantizamos el mejor precio en tu factura de luz sin cambios constantes de compañía.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
