import type { Metadata } from "next";
import { Mulish, Philosopher } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import WebVitalsReporter from "./WebVitalsReporter";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MLBoost",
  description: "Interactive ML coding practice platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mulish.variable} ${philosopher.variable} antialiased`}
      >
        <Providers>
          <WebVitalsReporter />
          {children}
        </Providers>
      </body>
    </html>
  );
}
