// lib/auth/token.ts

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    console.log("Running on server side, skipping token check");
    return null;
  }

  try {
    // Try to get token directly from localStorage
    console.log("Checking for auth token in localStorage");
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Found token in localStorage");
      return token;
    }

    // Fallback: Check if token is in user object
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.token) {
          console.log("Found token in user object");
          // Update localStorage to store token directly for next time
          localStorage.setItem("token", user.token);
          return user.token;
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }

    console.warn("No auth token found in localStorage");
    return null;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}
