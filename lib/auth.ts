import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { Resend } from "resend";
import { db } from "./db";
import * as schema from "./db/schema";
import { validateEmail, validateName } from "./validators/auth-input";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_123456789");

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // ab email verify kiye bina login nahi hoga
    sendResetPassword: async ({ user, url }) => {
      const { data, error } = await resend.emails.send({
        from: "CodePeeler <noreply@codepeeler.in>",
        to: user.email,
        subject: "Reset your CodePeeler password",
        html: `<p>Click <a href="${url}">here</a> to reset your password. If you didn't request this, you can safely ignore this email.</p>`,
      });
      if (error) console.error("Resend error (reset password):", error);
      else console.log("Resend sent (reset password):", data?.id);
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true, // OTP verify hote hi session cookie set ho jaaye, warna middleware dashboard se wapas /login pe bhej deta hai
    sendVerificationEmail: async ({ user, url }) => {
      const { data, error } = await resend.emails.send({
        from: "CodePeeler <noreply@codepeeler.in>",
        to: user.email,
        subject: "Verify your email - CodePeeler",
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
      });
      if (error) console.error("Resend error (verify email):", error);
      else console.log("Resend sent (verify email):", data?.id);
    },
  },

  user: {
    additionalFields: {
      // Gates /admin and /api/admin/* (see lib/admin.ts). input: false means
      // nobody can set/change this via signup or updateUser — only a direct
      // DB write (drizzle/manual-migration-admin-role.sql) can promote someone.
      role: {
        type: "string",
        input: false,
        defaultValue: "user",
      },
      banned: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  plugins: [
    // Powers VerifyEmailBanner: a 6-digit code instead of a magic link, so
    // the user never has to leave the dashboard tab to verify.
    emailOTP({
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true, // signup hote hi OTP mail chala jaaye
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification") return;
        const { data, error } = await resend.emails.send({
          from: "CodePeeler <noreply@codepeeler.in>",
          to: email,
          subject: "Verify your CodePeeler email",
          html: `<p>Your verification code is: <strong style="font-size:20px;letter-spacing:4px">${otp}</strong></p><p>This code will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>`,
        });
        if (error) console.error("Resend error (OTP):", error);
        else console.log("Resend sent (OTP):", data?.id);
      },
    }),
  ],

  // Server-side enforcement of name/email rules on the actual signup
  // request. The client-side checks in use-signup-form.ts only stop the
  // web form — anyone hitting /api/auth/sign-up/email directly (curl,
  // bots, temp-mail signup scripts) skipped them entirely. This runs the
  // same validators against the real request body, so short names and
  // disposable/junk emails get rejected no matter how the request arrives.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const { name, email } = ctx.body as { name?: string; email?: string };

      const nameCheck = validateName(name ?? "");
      if (!nameCheck.valid) {
        throw new APIError("BAD_REQUEST", { message: nameCheck.reason });
      }

      const emailCheck = validateEmail(email ?? "");
      if (!emailCheck.valid) {
        throw new APIError("BAD_REQUEST", { message: emailCheck.reason });
      }
    }),
  },

  // better-auth already rate-limits the email-OTP endpoints on its own
  // (/email-otp/*, /sign-in/email-otp — 3 requests per 60s, built into the
  // emailOTP plugin), but /sign-in/email, /sign-up/email, and the
  // token-based password-reset flow used above only fell back to the
  // global default (100 requests per 10s), which isn't tight enough to
  // slow down login brute-forcing or signup/reset spam. Rate limiting is
  // only active when NODE_ENV=production (better-auth default).
  rateLimit: {
    customRules: {
      "/sign-in/email": { window: 60, max: 5 }, // 5 login attempts/min per IP
      "/sign-up/email": { window: 60, max: 5 }, // 5 signups/min per IP
      "/request-password-reset": { window: 60, max: 3 }, // 3 reset emails/min per IP
      "/reset-password": { window: 60, max: 5 }, // 5 reset-token submissions/min per IP
    },
  },

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});