import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SeoSchema } from "@/components/seo-schema";
import { Toaster } from "@/components/ui/toast";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORINKO | Print Your Style",
  description: "Premium Oversized Printed T-Shirts. Made For Everyday Streetwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${manrope.className} antialiased text-foreground bg-background min-h-screen flex flex-col`}>
        <SeoSchema type="Organization" data={{}} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
