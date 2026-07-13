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
  title: { default: "Katalume — Practice machine learning into mastery.", template: "%s | Katalume" },
  description: "Katalume is the training ground for machine learning — solve real ML problems in an in-browser judge, compete in contests, and climb to mastery. LeetCode rigor meets Kaggle depth.",
  applicationName: "Katalume",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Katalume",
    title: "Katalume — Practice machine learning into mastery.",
    description: "Katalume is the training ground for machine learning — solve real ML problems in an in-browser judge, compete in contests, and climb to mastery. LeetCode rigor meets Kaggle depth.",
    url: "/",
  },
  twitter: { card: "summary", title: "Katalume", description: "Practice machine learning into mastery." },
  robots: { index: true, follow: true },
  icons: {
    icon: "/brand/katalume-mark.svg",
    shortcut: "/brand/katalume-mark.svg",
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
