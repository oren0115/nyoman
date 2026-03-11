/**
 * Environment config — set VITE_PUBLIC_API_URL in .env (no hardcoded URLs in app code).
 * Fallback to backend dev URL when unset or empty so requests don't hit the Vite server (404).
 */
const raw = import.meta.env.VITE_PUBLIC_API_URL;
const base = typeof raw === "string" && raw.trim() ? raw.trim() : "http://localhost:4000";
export const API_BASE = base.replace(/\/$/, "");
