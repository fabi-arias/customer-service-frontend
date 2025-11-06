// src/lib/auth.ts
// Utilidades de autenticación con AWS Cognito

export function buildLoginUrl() {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  const redirect = encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI!);
  const scope = encodeURIComponent("openid email profile");

  // Authorization Code flow (response_type=code)
  // Cognito intercambiará el code por token después de la autenticación
  return `${domain}/login?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirect}`;
}

export function buildLogoutUrl() {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
  const logout = encodeURIComponent(process.env.NEXT_PUBLIC_LOGOUT_URI!);
  return `${domain}/logout?client_id=${clientId}&logout_uri=${logout}`;
}

export function saveIdToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("id_token", token);
  }
}

export function getIdToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("id_token");
}

export function clearIdToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("id_token");
  }
}

// Claims mínimas (para rol)
export type Claims = {
  email?: string;
  ["cognito:groups"]?: string[] | string;
  exp?: number;
};

// Lee claims sin verificar firma (solo para UI)
export function parseClaims(token: string | null): Claims | null {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    // Decodificar base64url
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const data = JSON.parse(json);
    return data;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): "Supervisor" | "Agent" | "Unknown" {
  const claims = parseClaims(token);
  if (!claims) return "Unknown";

  const groups = claims["cognito:groups"];
  const arr = Array.isArray(groups) ? groups : groups ? [groups] : [];

  if (arr.includes("Supervisor")) return "Supervisor";
  if (arr.includes("Agent")) return "Agent";
  return "Unknown";
}

export function isTokenExpired(token: string | null): boolean {
  const claims = parseClaims(token);
  if (!claims?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return claims.exp < now;
}

export function getEmailFromToken(token: string | null): string | null {
  const claims = parseClaims(token);
  return claims?.email || null;
}

