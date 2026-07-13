// Shared name/email validation for auth forms (login/signup/forgot-password).
// Format checks + a block-list of common disposable/temp-mail domains, plus
// junk-pattern detection (keyboard mashes, "test@gmail.com" style addresses,
// short-letters-then-digits junk like "aa34433") so throwaway signups don't
// slip through before ever hitting the network.

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "tempinbox.com",
  "tempmail.net",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.biz",
  "guerrillamail.de",
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "yopmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "trash-mail.com",
  "getnada.com",
  "fakeinbox.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "spamgourmet.com",
  "emailondeck.com",
  "mailnesia.com",
  "mail-temporaire.fr",
  "discard.email",
  "discardmail.com",
  "spam4.me",
  "burnermail.io",
  "cs.email",
  "grr.la",
]);

// Obvious placeholder local-parts people type when they aren't giving a
// real address (test@gmail.com, asdf@gmail.com, etc).
const JUNK_LOCAL_PARTS = new Set([
  "test",
  "testing",
  "test123",
  "asdf",
  "asdfasdf",
  "abc",
  "abc123",
  "xyz",
  "fake",
  "fakeemail",
  "example",
  "user",
  "admin",
  "none",
  "na",
  "noemail",
  "null",
  "notreal",
  "dummy",
  "aaaa",
  "aaaaaa",
  "qwerty",
  "asdfgh",
]);

// "aa34433", "ab1234", "xyz9999" — a couple of letters followed by a run of
// digits with nothing else going on. Real names/emails almost never look
// like this; it's the classic shape of a mashed-keyboard test signup.
const LETTERS_THEN_DIGITS_JUNK = /^[a-z]{1,3}\d{3,}$/i;

function isKeyboardMash(value: string): boolean {
  // "aaaaaa", "111111" — a single character repeated 4+ times.
  if (/^(.)\1{3,}$/.test(value)) return true;
  // "asdasd", "abcabc" — a short chunk repeated back to back.
  if (/^(.{2,4})\1{2,}$/.test(value)) return true;
  return false;
}

function hasLowCharacterVariety(value: string): boolean {
  // e.g. "aabbaa" — 6 characters but only 2 distinct ones. Real names/local
  // parts of any length usually use more than a couple of unique letters.
  if (value.length < 5) return false;
  const distinct = new Set(value.split(""));
  return distinct.size <= 2;
}

export function validateEmail(email: string): { valid: true } | { valid: false; reason: string } {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, reason: "Enter your email address" };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "Enter a valid email address" };
  }

  const [localPart, domain] = trimmed.split("@");

  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Please use a permanent email address, not a temporary/disposable one" };
  }
  if (localPart && JUNK_LOCAL_PARTS.has(localPart)) {
    return { valid: false, reason: "This looks like a test/fake email — please use your real email" };
  }
  if (localPart && (isKeyboardMash(localPart) || LETTERS_THEN_DIGITS_JUNK.test(localPart) || hasLowCharacterVariety(localPart))) {
    return { valid: false, reason: "This email doesn't look valid — please use your real email" };
  }

  return { valid: true };
}

export function validateName(name: string): { valid: true } | { valid: false; reason: string } {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, reason: "Enter your name" };
  }
  if (trimmed.length < 2) {
    return { valid: false, reason: "Name looks too short" };
  }
  if (trimmed.length > 60) {
    return { valid: false, reason: "Name looks too long" };
  }
  // Letters (any script), spaces, apostrophes, hyphens and dots only — this
  // alone blocks names typed as digits/symbols, e.g. "aa34433" or "123".
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(trimmed)) {
    return { valid: false, reason: "Name should only contain letters" };
  }
  const compact = trimmed.replace(/\s+/g, "").toLowerCase();
  if (isKeyboardMash(compact) || hasLowCharacterVariety(compact)) {
    return { valid: false, reason: "Please enter your real name" };
  }

  return { valid: true };
}
