import { fetchWithAuth } from "./http";

export type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    createdAt: string;
};

export async function getProducts(): Promise<Product[]> {
    const r = await fetchWithAuth("/api/products");
    if (!r.ok) throw new Error(`GET products failed (HTTP ${r.status})`);
    return (await r.json()) as Product[];
}

export async function createProduct(input: {
  name: string;
  price: number;
  stock: number;
}): Promise<Product> {
  const r = await fetchWithAuth("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Create failed (HTTP ${r.status}): ${text}`);
  }

  return (await r.json()) as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const r = await fetchWithAuth(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (r.status === 204) return;
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Delete failed (HTTP ${r.status}): ${text}`);
  }
}