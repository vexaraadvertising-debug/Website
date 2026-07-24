import { getAdminProducts } from "@/lib/admin-actions";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import Image from "next/image";

export default async function AdminProductsPage() {
  const res = await getAdminProducts();
  const products = res.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Products Management</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage your store catalog and inventory</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/product-analytics">
            <button className="flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              View Analytics
            </button>
          </Link>
          <Link href="/admin/products/new">
            <button className="flex items-center gap-2 bg-magenta text-white hover:bg-magenta/90 text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              <Plus className="h-4 w-4" /> Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-magenta focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 bg-background border border-border hover:bg-secondary text-sm font-bold px-4 py-2 rounded-xl transition-colors w-full sm:w-auto justify-center">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No products found. Start by adding a new product.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-secondary overflow-hidden shrink-0 relative">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground line-clamp-1">{p.name}</div>
                          {p.isNew && (
                            <span className="text-[10px] bg-magenta/10 text-magenta px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.category}</td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-magenta">₹{p.price.toLocaleString()}</div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-xs text-muted-foreground line-through">₹{p.originalPrice.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={p.totalStock <= 5 ? "text-destructive font-extrabold" : "font-bold"}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.isActive ? (
                        <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full border border-success/20">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-secondary text-muted-foreground text-[10px] font-bold uppercase rounded-full border border-border">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/edit/${p.id}`}>
                          <button className="text-[10px] sm:text-xs font-bold bg-secondary hover:bg-magenta hover:text-white border border-border px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors">
                            Edit
                          </button>
                        </Link>
                        {/* We use a form or client component for delete, here just a button for UI presentation */}
                        <button className="p-2 bg-secondary hover:bg-destructive hover:text-white rounded-lg transition-colors border border-border text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
