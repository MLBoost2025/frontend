"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchBillingSummary } from "@/lib/api";
import { BillingSummary, BillingTier } from "@/types";

interface BillingContextValue {
  summary: BillingSummary | null;
  tier: BillingTier;
  benefits: string[];
  isPremium: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const BillingContext = createContext<BillingContextValue | undefined>(undefined);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setSummary(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setSummary(await fetchBillingSummary());
    } catch {
      // Access fails closed to Free when billing state cannot be verified.
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthLoading) void refresh();
  }, [isAuthLoading, refresh]);

  const value = useMemo<BillingContextValue>(() => {
    const tier = summary?.entitlement.tier || "free";
    const benefits = summary?.entitlement.benefits || [];
    return {
      summary,
      tier,
      benefits,
      isPremium: tier === "plus" || tier === "lumus",
      isLoading: isAuthLoading || isLoading,
      refresh,
    };
  }, [summary, isAuthLoading, isLoading, refresh]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const context = useContext(BillingContext);
  if (!context) throw new Error("useBilling must be used within BillingProvider");
  return context;
}
