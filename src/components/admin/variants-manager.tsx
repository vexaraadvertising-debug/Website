"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getProductVariants,
  addProductVariant,
  deleteProductVariant,
  updateVariantStock,
  seedDefaultVariantsAction,
} from "@/lib/admin-actions";
import { toast } from "@/lib/toast-store";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Grey", hex: "#9CA3AF" },
  { name: "Red", hex: "#EF4444" },
  { name: "Maroon", hex: "#800000" },
  { name: "Green", hex: "#22C55E" },
  { name: "Olive", hex: "#6B7280" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Orange", hex: "#F97316" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Beige", hex: "#D4B896" },
  { name: "Brown", hex: "#92400E" },
];

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
}

interface Props {
  productId: string;
  productSlug: string;
}

export function VariantsManager({ productId, productSlug }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New variant form state
  const [newSize, setNewSize] = useState("M");
  const [newColor, setNewColor] = useState("Black");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newStock, setNewStock] = useState(10);
  const [customColor, setCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState("");

  const loadVariants = useCallback(async () => {
    setLoading(true);
    const res = await getProductVariants(productId);
    if (res.success) {
      setVariants(res.data as Variant[]);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const handleColorPresetChange = (colorName: string) => {
    const preset = PRESET_COLORS.find((c) => c.name === colorName);
    if (preset) {
      setNewColor(preset.name);
      setNewColorHex(preset.hex);
      setCustomColor(false);
    }
  };

  const handleAdd = async () => {
    const colorName = customColor ? customColorName.trim() : newColor;
    if (!colorName) {
      toast.error("Please enter a color name.");
      return;
    }
    setAdding(true);
    const res = await addProductVariant({
      productId,
      productSlug,
      size: newSize,
      color: colorName,
      colorHex: newColorHex,
      stock: newStock,
    });
    if (res.success && res.data) {
      setVariants((prev) => [...prev, res.data as Variant]);
      toast.success(`Variant ${colorName} / ${newSize} added.`);
    } else {
      toast.error(res.error || "Failed to add variant.");
    }
    setAdding(false);
  };

  const handleDelete = (variantId: string) => {
    setDeleteTarget(variantId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget);
    const res = await deleteProductVariant(deleteTarget, productId, productSlug);
    if (res.success) {
      setVariants((prev) => prev.filter((v) => v.id !== deleteTarget));
      toast.success("Variant deleted.");
    } else {
      toast.error(res.error || "Failed to delete variant.");
    }
    setDeletingId(null);
    setDeleteTarget(null);
  };

  const handleStockUpdate = async (variantId: string, newVal: number) => {
    setUpdatingStockId(variantId);
    const res = await updateVariantStock(variantId, newVal, productId);
    if (res.success) {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, stock: newVal } : v))
      );
    } else {
      toast.error(res.error || "Failed to update stock.");
    }
    setUpdatingStockId(null);
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    const res = await seedDefaultVariantsAction(productId, productSlug);
    if (res.success) {
      toast.success(`Added ${res.added} default variants (5 sizes × 4 colours).`);
      await loadVariants();
    } else {
      toast.error(res.error || "Failed to seed defaults.");
    }
    setSeeding(false);
  };

  return (
    <div className="border border-border rounded-2xl p-6 bg-card mt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-magenta" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Variants</h2>
          <span className="text-xs text-muted-foreground font-normal normal-case">({variants.length} total)</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="rounded-xl text-xs font-bold uppercase tracking-wider border-magenta/30 text-magenta hover:bg-magenta/5"
          >
            {seeding ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Seeding…</> : "+ Add Default Sizes & Colours"}
          </Button>
          <button
            onClick={loadVariants}
            className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Existing variants */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading variants…
        </div>
      ) : variants.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-muted-foreground text-sm">No variants yet.</p>
          <Button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="bg-magenta hover:bg-magenta/90 text-white rounded-xl font-bold uppercase tracking-widest px-6"
          >
            {seeding
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding defaults…</>
              : "Add Default Sizes & Colours (S-XXL × Black/White/Navy/Grey)"}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase tracking-widest text-xs">
                <th className="text-left pb-3 pr-4">Colour</th>
                <th className="text-left pb-3 pr-4">Size</th>
                <th className="text-left pb-3 pr-4">Stock</th>
                <th className="text-left pb-3 pr-4">SKU</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((v) => (
                <tr key={v.id} className="group hover:bg-secondary/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 rounded-full border border-border shrink-0"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      <span className="font-semibold">{v.color}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="border border-border rounded-lg px-3 py-1 font-bold text-xs">{v.size}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setVariants((prev) =>
                            prev.map((vv) => (vv.id === v.id ? { ...vv, stock: val } : vv))
                          );
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          handleStockUpdate(v.id, val);
                        }}
                        className="w-20 h-8 rounded-lg border border-border bg-background px-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-magenta/40"
                      />
                      {updatingStockId === v.id && <Loader2 className="h-3 w-3 animate-spin text-magenta" />}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs font-mono truncate max-w-[160px]">{v.sku}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === v.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add new variant form */}
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-muted-foreground">Add New Variant</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Color */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Colour</label>
            {!customColor ? (
              <div className="flex gap-2">
                <select
                  value={newColor}
                  onChange={(e) => handleColorPresetChange(e.target.value)}
                  className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
                >
                  {PRESET_COLORS.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div
                  className="h-10 w-10 rounded-xl border border-border shrink-0"
                  style={{ backgroundColor: newColorHex }}
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  title="Pick hex"
                  className="h-10 w-10 rounded-xl border border-border shrink-0 cursor-pointer bg-transparent"
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Color name (e.g. Pastel Blue)"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-10 w-10 rounded-xl border border-border shrink-0 cursor-pointer"
                />
              </div>
            )}
            <button
              onClick={() => setCustomColor(!customColor)}
              className="text-xs text-magenta hover:underline mt-1"
            >
              {customColor ? "← Use preset colours" : "+ Custom colour"}
            </button>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Size</label>
            <div className="flex gap-2">
              <select
                value={PRESET_SIZES.includes(newSize) ? newSize : "__custom__"}
                onChange={(e) => {
                  if (e.target.value !== "__custom__") setNewSize(e.target.value);
                }}
                className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
              >
                {PRESET_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              {!PRESET_SIZES.includes(newSize) && (
                <input
                  type="text"
                  placeholder="e.g. 3XL"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                  className="w-24 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
                />
              )}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Stock</label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-magenta/40"
            />
          </div>
        </div>

        <Button
          onClick={handleAdd}
          disabled={adding}
          className="bg-magenta hover:bg-magenta/90 text-white rounded-xl font-bold uppercase tracking-widest px-6"
        >
          {adding ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding…</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Add Variant</>
          )}
        </Button>
      </div>

      <ConfirmDeleteDialog 
        open={!!deleteTarget} 
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deletingId !== null}
        title="Delete Variant?"
        description="Are you sure you want to delete this variant? This action cannot be undone."
      />
    </div>
  );
}
