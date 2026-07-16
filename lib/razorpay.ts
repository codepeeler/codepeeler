import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock12345",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret_12345",
});

// Razorpay subscriptions don't have a native "bill forever until cancelled"
// option — every plan needs a finite total_count of billing cycles. The
// common workaround (used industry-wide) is to set a large total_count —
// here, 10 years worth — and let the user cancel anytime via the cancel
// route below. The subscription simply won't reach total_count in practice.
export const PLAN_MAP = {
  monthly: { planId: process.env.RAZORPAY_PLAN_MONTHLY!, totalCount: 120 },
  yearly: { planId: process.env.RAZORPAY_PLAN_YEARLY!, totalCount: 10 },
} as const;

export type BillingCycle = keyof typeof PLAN_MAP;
