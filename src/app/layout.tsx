import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import WebVitalsReporter from "./WebVitalsReporter";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MLBoost",
  description: "Interactive ML coding practice platform",
  icons: {
    icon: "/brand/mlboost-mark.svg",
    shortcut: "/brand/mlboost-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${spaceMono.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <WebVitalsReporter />
          {children}
        </Providers>
      </body>
    </html>
  );
}
