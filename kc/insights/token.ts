// Service account access token for the GA4 Data API: an RS256 JWT signed with
// node:crypto, exchanged at Google's token endpoint. fetch and the clock are passed in.
import { createSign } from "node:crypto";

export type ServiceAccountKey = { client_email: string; private_key: string };
type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

export function signAssertion(key: ServiceAccountKey, nowMs: number): string {
  const iat = Math.floor(nowMs / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600 }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${b64url(signer.sign(key.private_key))}`;
}

export async function fetchAccessToken(
  key: ServiceAccountKey,
  fetchFn: Fetch,
  now: () => number = Date.now,
): Promise<{ accessToken: string; expiresAt: number }> {
  const assertion = signAssertion(key, now());
  const body = new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString();
  const res = await fetchFn(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  // Errors name the status only, never the key or the assertion.
  if (!res.ok) throw new Error(`Google token request failed with status ${res.status}`);
  const data = (await res.json()) as { access_token?: unknown; expires_in?: unknown };
  if (typeof data.access_token !== "string") throw new Error("Google token response had no access_token");
  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
  return { accessToken: data.access_token, expiresAt: now() + expiresIn * 1000 };
}
