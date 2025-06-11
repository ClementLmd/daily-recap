import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AuthCheck from "./components/auth/AuthCheck";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily Activity Tracker",
  description: "Track your daily activities and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Providers>
          <AuthCheck>
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthCheck>
        </Providers>
      </body>
    </html>
  );
}
