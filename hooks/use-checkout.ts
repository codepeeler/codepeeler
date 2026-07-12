"use client";

import { useState } from "react";
import { useToast } from "@/providers/toast-provider";
import { useSession } from "@/lib/auth-client";
import type { BillingCycle } from "@/lib/razorpay";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-checkout-js")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const startCheckout = async (billingCycle: BillingCycle) => {
    if (!session) {
      toast("Please sign in first");
      return;
    }

    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast("Couldn't load the payment gateway — check your connection");
        return;
      }

      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Couldn't start checkout");
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "CodePeeler",
        description: billingCycle === "monthly" ? "Pro — Monthly" : "Pro — Yearly",
        prefill: { name: session.user.name, email: session.user.email },
        theme: { color: "#000000" }, // TODO: swap for your brand's primary color
        handler: () => {
          toast("Payment successful — activating your plan");
          // The webhook (not this callback) is the source of truth for
          // activation — this is just an optimistic nudge. Reload after a
          // short delay so the webhook has time to land and update the DB.
          setTimeout(() => window.location.reload(), 2500);
        },
        modal: {
          ondismiss: () => toast("Checkout closed"),
        },
      });

      checkout.on("payment.failed", () => {
        toast("Payment failed — please try again");
      });

      checkout.open();
    } finally {
      setLoading(false);
    }
  };

  return { startCheckout, loading };
}
