"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Search, ShieldCheck } from "lucide-react";
import MainLayout from "../../components/MainLayout";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBillingAdminAlerts,
  fetchBillingAdminCustomers,
  fetchBillingAdminEvents,
  fetchBillingAdminOverview,
  resolveBillingAlert,
  runBillingReconciliation,
} from "@/lib/api";
import {
  BillingAdminCustomer,
  BillingAdminOverview,
  BillingOperationalAlert,
  BillingWebhookEvent,
} from "@/types";

function flag(value: boolean): string {
  return value ? "ON" : "OFF";
}

export default function AdminBillingPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<BillingAdminOverview | null>(null);
  const [alerts, setAlerts] = useState<BillingOperationalAlert[]>([]);
  const [events, setEvents] = useState<BillingWebhookEvent[]>([]);
  const [customers, setCustomers] = useState<BillingAdminCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    const [nextOverview, nextAlerts, nextEvents] = await Promise.all([
      fetchBillingAdminOverview(),
      fetchBillingAdminAlerts("open"),
      fetchBillingAdminEvents(),
    ]);
    setOverview(nextOverview);
    setAlerts(nextAlerts.alerts);
    setEvents(nextEvents.events);
  }, [isAdmin]);

  useEffect(() => {
    void refresh().catch(() => setMessage("Billing operations data could not be loaded."));
  }, [refresh]);

  async function searchCustomers(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    try {
      setCustomers((await fetchBillingAdminCustomers(query)).customers);
    } catch {
      setMessage("Customer search failed.");
    } finally {
      setWorking(false);
    }
  }

  async function reconcile() {
    setWorking(true);
    setMessage("");
    try {
      const run = await runBillingReconciliation();
      setMessage(`Reconciliation completed: ${run?.checked || 0} checks, ${run?.drifted || 0} drift.`);
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reconciliation failed.");
    } finally {
      setWorking(false);
    }
  }

  async function resolve(id: string) {
    setWorking(true);
    try {
      await resolveBillingAlert(id);
      await refresh();
    } catch {
      setMessage("The alert could not be resolved.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <MainLayout title="Billing operations" subtitle="Read-only support, reconciliation, and verified payment health">
      {authLoading ? <p className="text-sm text-zinc-500">Verifying admin access…</p> : !isAdmin ? (
        <section className="card p-6"><h2 className="text-lg font-semibold">Admin access required</h2></section>
      ) : (
        <>
          <section className="flex flex-col justify-between gap-4 rounded-3xl bg-[#08071a] p-6 text-white sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Financial safety</p>
              <h2 className="mt-2 text-2xl font-semibold">Billing control room</h2>
              <p className="mt-2 text-sm text-white/60">Reconciliation detects drift and opens alerts. It never grants access, refunds money, or edits provider state.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">Content admin</Link>
              <button onClick={reconcile} disabled={working} className="btn-primary disabled:opacity-50">
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Reconcile now
              </button>
            </div>
          </section>

          {overview ? (
            <>
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Customers", overview.counts.customers],
                  ["Active subscriptions", overview.counts.activeSubscriptions],
                  ["Lumus purchases", overview.counts.capturedPurchases],
                  ["Open alerts", overview.counts.openAlerts],
                  ["Failed webhooks", overview.counts.failedWebhooks],
                ].map(([label, value]) => (
                  <article key={String(label)} className="card p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </article>
                ))}
              </section>
              <section className="card p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Runtime switches</h2>
                <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Billing", overview.configuration.billingEnabled],
                    ["Checkout", overview.configuration.checkoutEnabled],
                    ["Webhooks", overview.configuration.webhookProcessingEnabled],
                    ["Enforcement", overview.configuration.enforcementEnabled],
                    ["Scheduler", overview.configuration.reconciliationEnabled],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl bg-zinc-100 p-3 dark:bg-white/[0.05]">
                      <span className="text-zinc-500">{label}</span>
                      <strong className={`ml-2 ${value ? "text-amber-600" : "text-emerald-600"}`}>{flag(Boolean(value))}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-amber-500" /> Open alerts</h2>
            {alerts.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> No open billing alerts.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {alerts.map((alert) => (
                  <article key={alert._id} className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div><p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">{alert.severity} · {alert.kind.replaceAll("_", " ")}</p><p className="mt-1 text-sm font-medium">{alert.summary}</p><p className="mt-1 font-mono text-[11px] text-zinc-500">{alert.resourceType}:{alert.resourceId}</p></div>
                      <button onClick={() => resolve(alert._id)} disabled={working} className="h-fit rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold dark:border-white/10">Mark reviewed</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Customer lookup</h2>
            <form onSubmit={searchCustomers} className="mt-4 flex max-w-xl gap-2">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or billing email" className="min-w-0 flex-1 rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm dark:border-white/10" />
              <button className="btn-primary" disabled={working}><Search className="h-4 w-4" /> Search</button>
            </form>
            {customers.length ? (
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase text-zinc-500"><tr><th className="pb-2">Customer</th><th className="pb-2">Phone</th><th className="pb-2">Subscription</th><th className="pb-2">Purchase</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id} className="border-t border-black/[0.06] dark:border-white/[0.07]"><td className="py-3"><strong>{customer.billingName}</strong><br /><span className="text-xs text-zinc-500">{customer.billingEmail}</span></td><td>•••• {customer.phoneLastFour}</td><td>{customer.subscription?.status || "—"}</td><td>{customer.purchase?.status || "—"}</td></tr>)}</tbody></table></div>
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Recent webhook events</h2>
            <div className="mt-4 space-y-2">
              {events.length === 0 ? <p className="text-sm text-zinc-500">No webhook events recorded.</p> : events.map((event) => (
                <div key={event._id} className="flex flex-col justify-between gap-1 rounded-xl bg-zinc-100 p-3 text-xs dark:bg-white/[0.04] sm:flex-row">
                  <span className="font-medium">{event.eventType}</span>
                  <span className="text-zinc-500">{event.status} · {new Date(event.createdAt).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </section>
          {message ? <p role="status" className="rounded-xl bg-brand-500/10 px-4 py-3 text-sm">{message}</p> : null}
        </>
      )}
    </MainLayout>
  );
}
