import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Loading from "./loading";
import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";
import { NotificationProvider } from "@/context/NotificationProvider";
import { Toaster } from "react-hot-toast";

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
        <ErrorBoundary>
          <ClientOnly>
            <NotificationProvider>
              <Toaster
                toastOptions={{
                  style: {
                    padding: "16px",
                    color: "#fff",
                    background: "#333",
                    borderRadius: "8px",
                  },
                  position: "top-right",
                }}
              />
              <Loading />
              {children}
            </NotificationProvider>
          </ClientOnly>
        </ErrorBoundary>
      </body>
    </html>
  );
}
