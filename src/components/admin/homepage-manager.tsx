"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, Edit2, Trash2, MoveUp, MoveDown, UploadCloud, Loader2, X } from "lucide-react";
import { saveHeroSlide, deleteHeroSlide, saveHomepageSection, deleteHomepageSection, updateHeroSlideStatus, reorderHeroSlides } from "@/lib/admin-actions";
import { uploadProductImageAction } from "@/lib/actions";
import { toast } from "@/lib/toast-store";
import { useRouter } from "next/navigation";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

type Tab = "slides" | "sections";

export default function HomepageManagerClient({ 
  initialSlides, 
  initialSections,
  allProducts 
}: { 
  initialSlides: any[], 
  initialSections: any[],
  allProducts: any[]
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("slides");
  
  const [slides, setSlides] = useState(initialSlides);
  const [sections, setSections] = useState(initialSections);
  
  const [loading, setLoading] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'slide' | 'section' } | null>(null);
  
  // Image Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const defaultSlide = { productId: "", desktopImage: "", mobileImage: "", heading: "", description: "", badge: "NEW ARRIVAL", isActive: true };
  const defaultSection = { title: "", type: "FEATURED", layout: "grid", productLimit: 4, isActive: true, order: sections.length };

  // ---------------------------------------------------------------------------
  // IMAGE UPLOAD LOGIC
  // ---------------------------------------------------------------------------
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave" || e.type === "drop") setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async (file: File, imageType: 'desktop' | 'mobile' = 'desktop') => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "orinko/hero");

      const result = await uploadProductImageAction(formData);
      
      if (result.success && result.secure_url) {
        if (imageType === 'mobile') {
          setEditingSlide((prev: any) => ({ ...prev, mobileImage: result.secure_url }));
        } else {
          setEditingSlide((prev: any) => ({ ...prev, desktopImage: result.secure_url }));
        }
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };


  // ---------------------------------------------------------------------------
  // HERO SLIDE ACTIONS
  // ---------------------------------------------------------------------------
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide.productId) return toast.error("Please select a product");
    if (!editingSlide.desktopImage) return toast.error("Please upload a desktop hero banner image");
    if (!editingSlide.mobileImage) return toast.error("Please upload a mobile hero banner image");
    
    setLoading(true);
    const res = await saveHeroSlide(editingSlide);
    if (res.success) {
      toast.success("Hero slide saved!");
      // We do a hard reload to ensure data stays in sync with server components
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to save slide");
    }
    setLoading(false);
  };

  const handleDeleteSlide = (id: string) => {
    setDeleteTarget({ id, type: 'slide' });
  };
  
  const handleToggleSlideStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    const res = await updateHeroSlideStatus(id, !currentStatus);
    if (res.success) {
      setSlides(slides.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      toast.success("Status updated");
    } else {
      toast.error("Failed to update status");
    }
    setLoading(false);
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    if (direction === 'up' && index > 0) {
      const tempItem = newSlides[index];
      newSlides[index] = newSlides[index - 1];
      newSlides[index - 1] = tempItem;
    } else if (direction === 'down' && index < newSlides.length - 1) {
      const tempItem = newSlides[index];
      newSlides[index] = newSlides[index + 1];
      newSlides[index + 1] = tempItem;
    } else {
      return;
    }
    
    setSlides(newSlides);
    
    setLoading(true);
    const res = await reorderHeroSlides(newSlides.map(s => s.id));
    if (res.success) {
      toast.success("Reordered successfully");
    } else {
      toast.error(res.error || "Failed to reorder");
    }
    setLoading(false);
  };

  // ---------------------------------------------------------------------------
  // SECTION ACTIONS
  // ---------------------------------------------------------------------------
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveHomepageSection(editingSection);
    if (res.success) {
      if (editingSection.id) {
        setSections(sections.map(s => s.id === editingSection.id ? editingSection : s));
        toast.success("Section updated");
      } else {
        window.location.reload();
      }
      setEditingSection(null);
    } else {
      toast.error(res.error || "Failed to save section");
    }
    setLoading(false);
  };

  const handleDeleteSection = (id: string) => {
    setDeleteTarget({ id, type: 'section' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    if (deleteTarget.type === 'slide') {
      const res = await deleteHeroSlide(deleteTarget.id);
      if (res.success) {
        setSlides(slides.filter(s => s.id !== deleteTarget.id));
        toast.success("Slide removed");
      } else {
        toast.error(`Error: ${res.error || "Unknown"}`);
      }
    } else {
      const res = await deleteHomepageSection(deleteTarget.id);
      if (res.success) {
        setSections(sections.filter(s => s.id !== deleteTarget.id));
        toast.success("Section deleted");
      } else {
        toast.error(`Error: ${res.error || "Unknown"}`);
      }
    }
    setLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("slides")}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
            activeTab === "slides" 
              ? "border-b-2 border-magenta text-magenta" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <ImageIcon className="h-4 w-4" /> Hero Banner Slides
        </button>
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
            activeTab === "sections" 
              ? "border-b-2 border-magenta text-magenta" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <ImageIcon className="h-4 w-4" /> Dynamic Sections
        </button>
      </div>

      <div className="p-6 md:p-10">
        {activeTab === "slides" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Hero Banner Slides</h2>
              <Button onClick={() => setEditingSlide(defaultSlide)} className="bg-magenta hover:bg-magenta/90 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add Slide
              </Button>
            </div>

            {editingSlide && (
              <div className="bg-secondary/30 p-6 rounded-2xl border border-border mb-8">
                <h3 className="font-extrabold uppercase mb-6">{editingSlide.id ? "Edit Hero Slide" : "New Hero Slide"}</h3>
                <form onSubmit={handleSaveSlide} className="space-y-6">
                  
                  {/* Row 1: Product & Image */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Linked Product</label>
                      <select 
                        required 
                        value={editingSlide.productId} 
                        onChange={e => setEditingSlide({...editingSlide, productId: e.target.value})} 
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none"
                      >
                        <option value="">Select a product to link...</option>
                        {allProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-muted-foreground mt-1">This product's page will open when "Shop Now" is clicked.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-muted-foreground uppercase">Desktop Banner (1920x900)</label>
                        {editingSlide.desktopImage ? (
                          <div className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-background">
                            <img src={editingSlide.desktopImage} alt="Desktop Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-4">
                              <button type="button" onClick={() => setEditingSlide({...editingSlide, desktopImage: ""})} className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors" title="Remove">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors cursor-pointer text-center px-4
                              ${isDragging ? 'border-magenta bg-magenta/5' : 'border-border bg-background hover:bg-secondary/20'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDragging(false);
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                handleUpload(e.dataTransfer.files[0], 'desktop');
                              }
                            }}
                            onClick={() => document.getElementById("hero-desktop-upload")?.click()}
                          >
                            <input 
                              id="hero-desktop-upload" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0], 'desktop');
                              }}
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <Loader2 className="h-6 w-6 animate-spin text-magenta mb-2" />
                            ) : (
                              <UploadCloud className="h-6 w-6 text-muted-foreground mb-2" />
                            )}
                            <p className="text-sm font-bold text-foreground">
                              {isUploading ? "Uploading..." : "Click or drag to upload"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-muted-foreground uppercase">Mobile Banner (Portrait)</label>
                        {editingSlide.mobileImage ? (
                          <div className="relative group rounded-xl overflow-hidden border border-border aspect-[3/4] bg-background w-32">
                            <img src={editingSlide.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-4">
                              <button type="button" onClick={() => setEditingSlide({...editingSlide, mobileImage: ""})} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors" title="Remove">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`w-full h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors cursor-pointer text-center px-4
                              ${isDragging ? 'border-magenta bg-magenta/5' : 'border-border bg-background hover:bg-secondary/20'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDragging(false);
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                handleUpload(e.dataTransfer.files[0], 'mobile');
                              }
                            }}
                            onClick={() => document.getElementById("hero-mobile-upload")?.click()}
                          >
                            <input 
                              id="hero-mobile-upload" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0], 'mobile');
                              }}
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-magenta mb-1" />
                            ) : (
                              <UploadCloud className="h-5 w-5 text-muted-foreground mb-1" />
                            )}
                            <p className="text-xs font-bold text-foreground">Upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Typography */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Custom Heading</label>
                      <input required type="text" placeholder="e.g. Summer Collection" value={editingSlide.heading} onChange={e => setEditingSlide({...editingSlide, heading: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Badge text (Optional)</label>
                      <input type="text" placeholder="e.g. NEW ARRIVAL" value={editingSlide.badge || ""} onChange={e => setEditingSlide({...editingSlide, badge: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-muted-foreground uppercase">Short Description (Optional)</label>
                      <input type="text" placeholder="A short description..." value={editingSlide.description || ""} onChange={e => setEditingSlide({...editingSlide, description: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <Button type="submit" disabled={loading} className="bg-magenta hover:bg-magenta/90 text-white font-bold rounded-xl px-8 h-12">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Hero Slide"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingSlide(null)} className="rounded-xl font-bold h-12 px-6">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {slides.map((slide, idx) => {
                const product = slide.product;
                if (!product) return null;

                return (
                  <div key={slide.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background border border-border rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 hidden md:flex">
                        <button disabled={idx === 0 || loading} onClick={() => moveSlide(idx, 'up')} className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-30"><MoveUp className="h-4 w-4" /></button>
                        <button disabled={idx === slides.length - 1 || loading} onClick={() => moveSlide(idx, 'down')} className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-30"><MoveDown className="h-4 w-4" /></button>
                      </div>
                      
                      {slide.desktopImage ? (
                        <img src={slide.desktopImage} alt="Banner" className="w-32 h-16 object-cover rounded-lg bg-secondary border border-border" />
                      ) : (
                        <div className="w-32 h-16 bg-secondary rounded-lg border border-border flex items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                      )}
                      
                      <div>
                        <h4 className="font-bold uppercase tracking-tight line-clamp-1">{slide.heading}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">Product: {product.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            disabled={loading}
                            onClick={() => handleToggleSlideStatus(slide.id, slide.isActive)}
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${slide.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}
                          >
                            {slide.isActive ? "Active" : "Hidden"}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-12 md:pl-0">
                      <Button variant="outline" size="sm" onClick={() => setEditingSlide(slide)} className="rounded-lg h-9 px-4">
                        <Edit2 className="h-3 w-3 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSlide(slide.id)} className="rounded-lg h-9 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
              {slides.length === 0 && !editingSlide && (
                <div className="p-10 text-center border border-dashed border-border rounded-xl text-muted-foreground font-medium">
                  No hero slides created yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sections" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Homepage Sections</h2>
              <Button onClick={() => setEditingSection(defaultSection)} className="bg-magenta hover:bg-magenta/90 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl">
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </div>

            {editingSection && (
              <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                <h3 className="font-extrabold uppercase mb-4">{editingSection.id ? "Edit Section" : "New Section"}</h3>
                <form onSubmit={handleSaveSection} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Title</label>
                      <input required type="text" value={editingSection.title} onChange={e => setEditingSection({...editingSection, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Type</label>
                      <select value={editingSection.type} onChange={e => setEditingSection({...editingSection, type: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none">
                        <option value="FEATURED">Featured Products</option>
                        <option value="TRENDING">Trending Collection</option>
                        <option value="NEW_ARRIVALS">New Arrivals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Layout</label>
                      <select value={editingSection.layout} onChange={e => setEditingSection({...editingSection, layout: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 outline-none">
                        <option value="grid">Grid (Wrap)</option>
                        <option value="carousel">Carousel (Horizontal Scroll)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="bg-magenta hover:bg-magenta/90 text-white font-bold rounded-xl px-6">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingSection(null)} className="rounded-xl font-bold">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div key={section.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-bold">{section.title}</h4>
                      <p className="text-xs text-muted-foreground uppercase">{section.type} • {section.layout}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingSection(section)} className="rounded-lg h-8 px-3">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteSection(section.id)} className="rounded-lg h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
              {sections.length === 0 && !editingSection && (
                <div className="p-10 text-center border border-dashed border-border rounded-xl text-muted-foreground font-medium">
                  No sections created yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog 
        open={!!deleteTarget} 
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={loading}
        title={`Delete ${deleteTarget?.type === 'slide' ? 'Slide' : 'Section'}?`}
      />
    </div>
  );
}
