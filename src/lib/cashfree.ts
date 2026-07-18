import { load } from "@cashfreepayments/cashfree-js";
import { BillingCheckout } from "@/types";

export async function openCashfreeCheckout(checkout: BillingCheckout): Promise<void> {
  const cashfree = await load({ mode: checkout.environment });
  if (!cashfree) throw new Error("Secure checkout is unavailable in this browser.");
  const result = checkout.kind === "subscription"
    ? await cashfree.subscriptionsCheckout({
        subsSessionId: checkout.subscriptionSessionId,
        redirectTarget: "_self",
      })
    : await cashfree.checkout({
        paymentSessionId: checkout.paymentSessionId,
        redirectTarget: "_self",
      });
  if (result.error) {
    throw new Error(result.error.message || "Secure checkout could not be opened.");
  }
}
