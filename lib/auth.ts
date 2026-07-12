import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "./db";
import * as schema from "./db/schema";

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    requireEmailVerification: false, // chaho to true kar sakte ho baad mein
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "onboarding@resend.dev", // apna verified domain aane ke baad ye badlega
        to: user.email,
        subject: "Apna CodePeeler password reset karein",
        html: `<p>Password reset karne ke liye <a href="${url}">yahan click karein</a>. Agar aapne request nahi ki to is email ko ignore karein.</p>`,
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Apna email verify karein - CodePeeler",
        html: `<p>Email verify karne ke liye <a href="${url}">yahan click karein</a>.</p>`,
      });
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
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification") return;
        await resend.emails.send({
          from: "onboarding@resend.dev", // apna verified domain aane ke baad ye badlega
          to: email,
          subject: "Apna CodePeeler email verify karein",
          html: `<p>Aapka verification code hai: <strong style="font-size:20px;letter-spacing:4px">${otp}</strong></p><p>Ye code 5 minute mein expire ho jaayega. Agar aapne request nahi ki to is email ko ignore karein.</p>`,
        });
      },
    }),
  ],

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});