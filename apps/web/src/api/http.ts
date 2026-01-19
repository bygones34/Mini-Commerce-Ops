import { clearToken, getToken } from "../auth/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5165";

type FetchOptions = RequestInit & {
    auth?: boolean;
};

export async function fetchWithAuth(
    path: string,
    options: FetchOptions = {}
): Promise<Response> {
    const token = getToken();

    const headers: HeadersInit = {
        ...(options.headers ?? {}),
        ...(options.auth !== false && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
    };

    const r = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    // Global 401 Handler
    if (r.status === 401) {
        clearToken();

        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    return r;
}