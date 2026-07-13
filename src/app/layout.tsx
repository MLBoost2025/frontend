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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "MLBoost — Practice machine learning by building", template: "%s | MLBoost" },
  description: "Practice production-minded machine learning through focused coding problems, learning tracks, and competitions.",
  applicationName: "MLBoost",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MLBoost",
    title: "MLBoost — Practice machine learning by building",
    description: "Focused ML coding problems, learning tracks, and competitions.",
    url: "/",
  },
  twitter: { card: "summary", title: "MLBoost", description: "Practice machine learning by building." },
  robots: { index: true, follow: true },
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
