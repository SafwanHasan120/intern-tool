import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { ResumeProvider } from "@/context/ResumeContext";
import NavBar from "@/components/NavBar";
import ResumeModal from "@/components/ResumeModal";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Summer 2027 Internships — Curated",
  description:
    "A curated, premium dashboard of Summer 2027 internships. Search, filter, and apply with calm and clarity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="min-h-screen antialiased">
        <ResumeProvider>
          <NavBar />
          <ResumeModal />
          {children}
        </ResumeProvider>
      </body>
    </html>
  );
}
