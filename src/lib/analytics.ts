export interface AnalyticsEvent {
  name: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
}

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

function enrichEvent(event: AnalyticsEvent): AnalyticsEvent {
  return {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const enriched = enrichEvent(event);

  if (typeof window !== "undefined") {
    const history = window.localStorage.getItem("mlboost.analytics.events");
    const parsed = history ? (JSON.parse(history) as AnalyticsEvent[]) : [];
    parsed.unshift(enriched);
    window.localStorage.setItem(
      "mlboost.analytics.events",
      JSON.stringify(parsed.slice(0, 150))
    );
  }

  if (!ANALYTICS_ENDPOINT) {
    return;
  }

  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
      keepalive: true,
    });
  } catch {
    // No-op for analytics failures.
  }
}
