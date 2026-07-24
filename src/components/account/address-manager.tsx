"use client";

import { useState, useEffect } from "react";
import { getAddresses, addAddress, deleteAddress, setDefaultAddress, editAddress } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2, CheckCircle, Plus, X } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/lib/toast-store";

export function AddressManager() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  async function loadAddresses() {
    setLoading(true);
    const res = await getAddresses();
    if (res.success) {
      setAddresses(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    await deleteAddress(deleteTarget);
    await loadAddresses();
    setDeleteTarget(null);
  }

  async function handleSetDefault(id: string) {
    await setDefaultAddress(id);
    loadAddresses();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      phone: formData.get("phone") as string,
      label: formData.get("label") as string,
      isDefault: formData.get("isDefault") === "on",
    };

    let res;
    if (editingAddress) {
      res = await editAddress(editingAddress.id, data);
    } else {
      res = await addAddress(data);
    }

    if (res.success) {
      setShowAddForm(false);
      setEditingAddress(null);
      loadAddresses();
    } else {
      toast.error(res.error || (editingAddress ? "Failed to edit address" : "Failed to add address"));
    }
    setSubmitting(false);
  }

  const openEdit = (addr: any) => {
    setEditingAddress(addr);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="font-extrabold text-xl uppercase">Shipping Address</h3>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm" variant="outline" className="rounded-xl font-bold uppercase text-xs">
            <Plus className="h-4 w-4 mr-1" /> Add New
          </Button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-border rounded-xl bg-secondary/30 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-sm uppercase">{editingAddress ? "Edit Address" : "Add New Address"}</h4>
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" defaultValue={editingAddress?.firstName} required placeholder="First Name" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
            <input name="lastName" defaultValue={editingAddress?.lastName} required placeholder="Last Name" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="phone" type="tel" defaultValue={editingAddress?.phone} required placeholder="Phone Number (Required)" pattern="[0-9]{10,15}" title="Please enter a valid phone number" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
            <input name="label" defaultValue={editingAddress?.label} placeholder="Label (e.g., Home, Work)" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
          </div>
          <input name="street" defaultValue={editingAddress?.street} required placeholder="Street Address" className="w-full p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" defaultValue={editingAddress?.city} required placeholder="City" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
            <input name="state" defaultValue={editingAddress?.state} required placeholder="State" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="postalCode" defaultValue={editingAddress?.postalCode} required placeholder="ZIP / Postal Code" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
            <input name="country" defaultValue={editingAddress?.country || "India"} required placeholder="Country (e.g., India)" className="p-2 rounded border border-border bg-background text-sm focus:ring-2 focus:ring-magenta outline-none" />
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" name="isDefault" defaultChecked={editingAddress?.isDefault} className="rounded border-border text-magenta" />
              <span>Set as Default</span>
            </label>
          </div>
          <Button disabled={submitting} type="submit" className="w-full rounded-xl bg-magenta text-white font-bold uppercase text-xs">
            {submitting ? "Saving..." : "Save Address"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-secondary rounded-xl"></div>
        </div>
      ) : addresses.length === 0 ? (
        !showAddForm && (
          <div className="p-4 border border-border rounded-xl bg-background text-sm space-y-1 text-center py-8 text-muted-foreground">
            <p className="font-bold text-foreground">No addresses found</p>
            <p className="text-xs">You haven't added any shipping addresses yet.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`p-4 border rounded-xl relative ${addr.isDefault ? 'border-magenta bg-magenta/5' : 'border-border bg-background'}`}>
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-magenta"><CheckCircle className="h-5 w-5" /></span>
              )}
              <h4 className="font-bold text-foreground capitalize mb-1">
                {addr.label ? `${addr.label} - ` : ''}{addr.firstName} {addr.lastName}
              </h4>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {addr.street}<br/>
                {addr.city}, {addr.state} {addr.postalCode}<br/>
                {addr.country}<br/>
                <span className="font-bold text-foreground">Phone:</span> {addr.phone || <span className="text-destructive font-bold text-xs uppercase">Missing Phone</span>}
              </p>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <Button onClick={() => handleSetDefault(addr.id)} variant="outline" size="sm" className="h-8 text-xs font-bold uppercase">Set Default</Button>
                )}
                <Button onClick={() => openEdit(addr)} variant="outline" size="sm" className="h-8 text-xs font-bold uppercase">
                  Edit
                </Button>
                <Button onClick={() => handleDelete(addr.id)} variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10 uppercase">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog 
        open={!!deleteTarget} 
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={loading}
        title="Delete Address?"
        description="Are you sure you want to delete this shipping address?"
      />
    </div>
  );
}
