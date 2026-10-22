import type { Metadata } from "next";
import { Geist_Mono, League_Spartan } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { ThemeProvider } from "@/features/theme/provider/theme-provider";
import { themeInitScript } from "@/features/theme/theme";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BiteBill",
  description:
    "BiteBill is an invoicing application that enables freelancers, consultants, agencies, and small businesses to create professional invoices, manage clients, track payments, generate branded PDF invoices, and monitor business performance through a comprehensive analytics dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${leagueSpartan.variable} ${geistMono.variable} h-full antialiased scrollbar-purple`}
      data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
