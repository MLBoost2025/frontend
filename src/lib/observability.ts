import * as Sentry from "@sentry/nextjs";

export function reportError(error: unknown, context?: Record<string, unknown>) {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(normalizedError, {
    extra: context,
  });

  if (process.env.NODE_ENV !== "production") {
    console.error("[observability]", normalizedError, context);
  }
}

export function reportMessage(
  message: string,
  context?: Record<string, unknown>
) {
  Sentry.captureMessage(message, {
    level: "info",
    extra: context,
  });
}
