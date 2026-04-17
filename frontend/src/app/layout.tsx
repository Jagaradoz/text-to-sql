import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Text-to-SQL Assistant",
  description: "AI-powered natural language database query tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <div className="centered-layout flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
