import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Metrostav Development — Ultimate Dashboard",
  description: "Monitoring ceníků bytů — MidoHarfa, Nad Skalou, Viladomy u Mlýna, Na Vackově",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" style={{ colorScheme: 'light' }} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Sdílený header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <img src="/md-logo.webp" alt="Metrostav Development" style={{ height: 48, width: 'auto' }} />
            <span style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 20, fontWeight: 800,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#DB0D15',
              whiteSpace: 'nowrap',
            }}>Ultimate Dashboard</span>
            <span style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Monitoring ceníků</span>
          </div>
        </header>

        {/* Navigace */}
        <Nav />

        {/* Obsah stránky */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
