import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Loading from "./loading";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Service Center Portal",
  description: "Managed by Garantie.in",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Loading />
        {children}
      </body>
    </html>
  );
}