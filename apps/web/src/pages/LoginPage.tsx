import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setToken } from "../auth/auth";

export default function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("admin@miniops.local");
    const [password, setPassword] = useState("123456");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        setSaving(true);
        try {
            const token = await login(email.trim(), password);
            setToken(token);
            nav("/products", { replace: true });
        } catch (e: any) {
            setError(e?.message ?? "Login failed.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto flex min-h-screen max-w-md items-center p-6">
                <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                    <h1 className="text-xl font-semibold">Sign in</h1>
                    <p className="mt-1 text-sm text-slate-300">
                        Use your MiniOps admin account.
                    </p>

                    <form onSubmit={onSubmit} className="mt-4 space-y-3">
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                                Email
                            </label>
                            <input
                                id="email"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none focus:border-slate-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@miniops.local"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none focus:border-slate-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-900 disabled:opacity-60"
                        >
                            {saving ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-4 text-xs text-slate-400">
                        Demo: admin@miniops.local / 123456
                    </p>
                </div>
            </div>
        </div>
    );
}