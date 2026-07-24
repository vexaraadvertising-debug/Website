"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DateRangePicker, DateRange } from "@/components/admin/date-range-picker";
import { ExportButtons } from "@/components/admin/export-buttons";

export function ProductsView({ products, summary, startDateStr, endDateStr }: { products: any[], summary: any, startDateStr: string, endDateStr: string }) {
  const router = useRouter();

  const handleDateChange = (range: DateRange) => {
    const params = new URLSearchParams();
    params.set("startDate", range.from.toISOString());
    params.set("endDate", range.to.toISOString());
    router.push(`/admin/product-analytics?${params.toString()}`);
  };

  const columns = [
    { header: "Name", key: "name" },
    { header: "Category", key: "category" },
    { header: "Price", key: "price" },
    { header: "Stock", key: "stock" },
    { header: "Status", key: "status" },
    { header: "Sold (Period)", key: "soldInPeriod" },
    { header: "Revenue (Period)", key: "revenueInPeriod" },
    { header: "Date Added", key: "createdAt" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">Products Analytics</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Track product performance and sales velocity.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={products} filename="Orinko_Products" columns={columns} />
          <DateRangePicker onDateChange={handleDateChange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Total Products</h3>
          <p className="text-2xl font-extrabold">{summary.total}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Out of Stock</h3>
          <p className="text-2xl font-extrabold text-destructive">{summary.outOfStock}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Units Sold (Period)</h3>
          <p className="text-2xl font-extrabold text-magenta">{summary.productsSoldInPeriod}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <h3 className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-1">Revenue (Period)</h3>
          <p className="text-2xl font-extrabold text-success">₹{summary.totalRevenueInPeriod.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground font-medium">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center text-magenta">Sold (Period)</th>
                  <th className="px-6 py-4 text-right text-magenta">Revenue (Period)</th>
                  <th className="px-6 py-4 text-right">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground max-w-[200px] truncate">{p.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.category}</td>
                    <td className="px-6 py-4 text-right">₹{p.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={p.stock <= 5 ? "text-destructive font-extrabold" : "font-bold"}>{p.stock}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-magenta bg-magenta/5">{p.soldInPeriod}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-magenta bg-magenta/5">₹{p.revenueInPeriod.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${p.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : p.status === 'Out of Stock' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/products/edit/${p.id}`}>
                        <button className="text-xs font-bold bg-secondary hover:bg-magenta hover:text-white border border-border px-3 py-1.5 rounded-lg transition-colors">
                          Edit
                        </button>
                      </Link>
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
