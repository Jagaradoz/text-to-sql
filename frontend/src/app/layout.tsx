import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
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
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1 centered-layout py-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
