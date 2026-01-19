import { useEffect, useState, type FormEvent } from "react";
import type { Product } from "../api/products";
import { createProduct, deleteProduct, getProducts } from "../api/products";
import { clearToken } from "../auth/auth";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [price, setPrice] = useState<string>("0");
    const [stock, setStock] = useState<string>("0");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const nav = useNavigate();

    function logout() {
        clearToken();
        nav("/login", { replace: true });
    }

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await getProducts();
            setItems(data);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);

        const trimmed = name.trim();
        if (!trimmed) return setFormError("Name is required");

        const parsedPrice = Number(price);
        const parsedStock = Number(stock);

        if (Number.isNaN(parsedPrice) || parsedPrice < 0)
            return setFormError("Price must be a number >= 0.");
        if (!Number.isInteger(parsedStock) || parsedStock < 0)
            return setFormError("Stock must be an integer >= 0.");

        setSaving(true);
        try {
            await createProduct({ name: trimmed, price: parsedPrice, stock: parsedStock });
            setName("");
            setPrice("0");
            setStock("0");
            await load();
        } catch (e: any) {
            setFormError(e?.message ?? "Create faied.");
        } finally {
            setSaving(false);
        }
    }

    async function onDelete(id: string) {
        const ok = window.confirm("Delete this product?");
        if (!ok) return;

        try {
            await deleteProduct(id);
            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e: any) {
            alert(e?.message ?? "Delete failed.");
        }
    }


    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-5xl p-6">
                <div>
                    <header className="mb-6">
                        <h1 className="text-2xl font-semibold">Mini Commerce Ops</h1>
                        <p className="text-slate-300">React + Tailwind + .NET 10 API</p>
                    </header>
                </div>
                <button onClick={logout}
                    className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-950/70">
                    Logout
                </button>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Create */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                        <h2 className="mb-4 text-lg font-medium">Add Product</h2>

                        <form onSubmit={onSubmit} className="space-y-3">
                            <div>
                                <label htmlFor="product-name" className="mb-1 block text-sm text-slate-300">
                                    Name
                                </label>
                                <input
                                    id="product-name"
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none focus:border-slate-600"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. T-Shirt"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="product-price" className="mb-1 block text-sm text-slate-300">
                                        Price
                                    </label>
                                    <input
                                        id="product-price"
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none focus:border-slate-600"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="product-stock" className="mb-1 block text-sm text-slate-300">
                                        Stock
                                    </label>
                                    <input
                                        id="product-stock"
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none focus:border-slate-600"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        inputMode="numeric"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
                                    {formError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-slate-900 disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Create"}
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-medium">Products</h2>
                            <button
                                onClick={load}
                                className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-950/70"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading && <div className="text-slate-300">Loading...</div>}

                        {error && (
                            <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-red-200">
                                Error: {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-slate-300">
                                        <tr className="[&>th]:py-2">
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Created</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((p) => (
                                            <tr key={p.id} className="border-t border-slate-800 [&>td]:py-2">
                                                <td className="font-medium">{p.name}</td>
                                                <td>{p.price}</td>
                                                <td>{p.stock}</td>
                                                <td className="text-slate-300">
                                                    {new Date(p.createdAt).toLocaleString()}
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => onDelete(p.id)}
                                                        className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-1 text-xs text-red-200 hover:bg-red-950/60"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {items.length === 0 && (
                                    <div className="mt-3 text-slate-300">No products yet.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

