// Shared email validation for auth forms (login/signup/forgot-password).
// Basic format check + a block-list of common disposable/temp-mail domains,
// so we don't waste a password-reset email on a throwaway address.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "getnada.com",
  "fakeinbox.com",
  "sharklasers.com",
  "dispostable.com",
]);

export function validateEmail(email: string): { valid: true } | { valid: false; reason: string } {
  const trimmed = email.trim();

  if (!trimmed) {
    return { valid: false, reason: "Enter your email address" };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "Enter a valid email address" };
  }

  const domain = trimmed.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Please use a permanent email address" };
  }

  return { valid: true };
}
