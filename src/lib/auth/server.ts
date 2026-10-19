import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

export const isNeonAuthConfigured = Boolean(baseUrl && cookieSecret);

export const auth = createNeonAuth({
  baseUrl: baseUrl ?? "https://auth.invalid",
  cookies: {
    secret: cookieSecret ?? "development-only-neon-auth-cookie-secret-change-me",
    sessionDataTtl: 300,
  },
});
