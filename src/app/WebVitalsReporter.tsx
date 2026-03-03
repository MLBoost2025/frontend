"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    void trackEvent({
      name: "web_vital",
      payload: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        delta: metric.delta,
      },
    });
  });

  return null;
}
