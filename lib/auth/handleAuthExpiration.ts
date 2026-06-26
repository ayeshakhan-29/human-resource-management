export function handleAuthExpiration(reason?: string): void {
  if (typeof window === "undefined") return;

  try {
    // UI flag so the next render can show an inline message
    sessionStorage.setItem("auth_expired_ui", "1");

    // Prevent redirect loops (e.g., if token still invalid after reload)
    const redirectKey = "auth_expired_redirected";
    const alreadyRedirected = sessionStorage.getItem(redirectKey);

    // Always clear local auth
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Force a hard reload so app state resets completely
    // (some pages keep stale SWR state otherwise)
    if (!alreadyRedirected) {
      sessionStorage.setItem(redirectKey, "1");
    }

    // Reload first, then redirect to login.
    // Using setTimeout to allow reload to happen; if reload wins, replace may be skipped.
    window.location.reload();
    setTimeout(() => {
      window.location.replace("/login");
    }, 50);
  } catch (e) {
    // Fallback if anything fails
    window.location.replace("/login");
  }
}
