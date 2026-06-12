/** Presentation / offline mode — no Railway or MySQL required. */
export function isDemoMode() {
  const v = String(process.env.STARBUS_DEMO ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
