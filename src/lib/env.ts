/**
 * Environment config — set PUBLIC_API_URL in .env (no hardcoded URLs in app code).
 */
export const API_BASE = import.meta.env.PUBLIC_API_URL ?? "";
