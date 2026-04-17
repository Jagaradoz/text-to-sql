import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Text-to-SQL Assistant",
  description: "AI-powered database analysis system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${inter.className} h-full bg-background text-foreground overflow-hidden`}>
        <main className="h-full">{children}</main>
      </body>
    </html>
  );
}
