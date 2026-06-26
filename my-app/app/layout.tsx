import type { Metadata } from "next";
import { ResumeProvider } from "@/context/ResumeContext";
import NavBar from "@/components/NavBar";
import ResumeModal from "@/components/ResumeModal";

export const metadata: Metadata = {
  title: "Summer 2027 Internship Dashboard",
  description: "Internship dashboard for Summer 2027",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ResumeProvider>
          <NavBar />
          <ResumeModal />
          {children}
        </ResumeProvider>
      </body>
    </html>
  );
}
