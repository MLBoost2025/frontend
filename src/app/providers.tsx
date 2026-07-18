"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { BillingProvider } from "@/context/BillingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "system"]}
      disableTransitionOnChange
    >
      <AuthProvider>
        <BillingProvider>{children}</BillingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
