import { fetchWithAuth } from "./http";

export async function login(
  email: string,
  password: string
): Promise<string> {
  const r = await fetchWithAuth("/api/auth/login", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!r.ok) {
    if (r.status === 401) throw new Error("Invalid email or password.");
    const text = await r.text();
    throw new Error(`Login failed (HTTP ${r.status}): ${text}`);
  }

  const data = (await r.json()) as { accessToken: string };
  return data.accessToken;
}