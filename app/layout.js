import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { isClerkConfigured } from "@/lib/env";
import { RootFooter } from "@/components/root-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expense Ledger",
  description: "One stop tracking of your finances",
};

export default function RootLayout({ children }) {
  const page = (
    <html lang="en">
      <head>
        <link rel="icon" href="/expense-ledger-icon.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen">{children}</main>
        <Toaster richColors position="top-right" />
        <RootFooter />
      </body>
    </html>
  );

  return isClerkConfigured ? <ClerkProvider>{page}</ClerkProvider> : page;
}
