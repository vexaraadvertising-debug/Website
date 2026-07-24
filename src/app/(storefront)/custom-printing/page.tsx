"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";
import { Upload, Type, RotateCcw, Trash2, ShoppingBag, Palette, LayoutTemplate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { uploadProductImageAction } from "@/lib/actions";
import { toast } from "@/lib/toast-store";

type CanvasElement = {
  id: string;
  type: "image" | "text";
  src?: string;
  text?: string;
  color?: string;
  fontFamily?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export default function CustomPrintingStudio() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"front" | "back">("front");
  const [color, setColor] = useState("white");
  const addItem = useCartStore((state) => state.addItem);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basePrice = 799;
  const pricePerElement = 150;
  const totalPrice = basePrice + (elements.length * pricePerElement);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    const res = await uploadProductImageAction(data);
    if (res.success && res.secure_url) {
      const newEl: CanvasElement = {
        id: Math.random().toString(),
        type: "image",
        src: res.secure_url,
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0
      };
      setElements([...elements, newEl]);
      setSelectedId(newEl.id);
    } else {
      toast.error("Failed to upload image to Cloudinary: " + (res.error || "Unknown error"));
    }
    setUploading(false);
  };

  const handleAddText = () => {
    const newEl: CanvasElement = {
      id: Math.random().toString(),
      type: "text",
      text: "Double click to edit",
      color: "#000000",
      fontFamily: "Arial",
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      rotation: 0
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, data: Partial<CanvasElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...data } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleAddToCart = () => {
    const imgEl = elements.find(el => el.type === "image");
    
    addItem({
      id: `custom-${Math.random()}`,
      productId: "custom-tshirt",
      name: `Custom Print T-Shirt (${view.toUpperCase()})`,
      price: totalPrice,
      image: imgEl?.src || "/images/hero_model.jpg",
      color: color,
      size: "M",
      quantity: 1,
      customImage: imgEl?.src || undefined
    });
    toast.success("Custom design added to cart successfully!");
  };

  return (
    <div className="bg-secondary/30 min-h-screen pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-8">
          Custom Printing Studio
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Tools Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-extrabold uppercase tracking-widest text-sm mb-4">Add Elements</h3>
              <div className="space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleImageUpload}
                />
                <Button 
                  variant="outline" 
                  disabled={uploading}
                  className="w-full justify-start h-12 rounded-xl font-bold"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-magenta" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload Image
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 rounded-xl font-bold"
                  onClick={handleAddText}
                >
                  <Type className="mr-2 h-4 w-4" /> Add Text
                </Button>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-extrabold uppercase tracking-widest text-sm mb-4">Garment Settings</h3>
              
              <div className="mb-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">T-Shirt Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "white", bg: "bg-white", border: "border-border" },
                    { id: "black", bg: "bg-black", border: "border-black" },
                    { id: "navy", bg: "bg-slate-900", border: "border-slate-900" },
                    { id: "heather-grey", bg: "bg-neutral-300", border: "border-neutral-300" },
                    { id: "red", bg: "bg-red-600", border: "border-red-600" },
                    { id: "maroon", bg: "bg-red-950", border: "border-red-950" },
                    { id: "forest-green", bg: "bg-green-900", border: "border-green-900" },
                    { id: "royal-blue", bg: "bg-blue-700", border: "border-blue-700" }
                  ].map((c) => (
                    <button 
                      key={c.id}
                      onClick={() => setColor(c.id)} 
                      title={c.id}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${color === c.id ? "border-magenta ring-2 ring-magenta/20 scale-110" : "border-transparent"} ${c.bg} shadow-sm`} 
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Print Location</label>
                <div className="flex gap-2 bg-secondary p-1 rounded-xl">
                  <button 
                    onClick={() => setView("front")} 
                    className={`flex-1 py-2 rounded-lg text-sm font-bold ${view === "front" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Front
                  </button>
                  <button 
                    onClick={() => setView("back")} 
                    className={`flex-1 py-2 rounded-lg text-sm font-bold ${view === "back" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contextual Edit Panel */}
            {selectedId && (
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-extrabold uppercase tracking-widest text-sm mb-4">Edit Selection</h3>
                {elements.find(e => e.id === selectedId)?.type === 'text' && (
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Text Content</label>
                      <input 
                        type="text" 
                        className="w-full border border-border rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-magenta outline-none"
                        value={elements.find(e => e.id === selectedId)?.text}
                        onChange={(e) => updateElement(selectedId, { text: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">Color</label>
                      <input 
                        type="color" 
                        className="w-full h-10 rounded-lg cursor-pointer"
                        value={elements.find(e => e.id === selectedId)?.color}
                        onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="destructive" 
                  className="w-full h-10 rounded-xl font-bold"
                  onClick={() => deleteElement(selectedId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Element
                </Button>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-6 bg-background rounded-3xl border border-border overflow-hidden flex items-center justify-center relative min-h-[600px]">
            {/* T-Shirt Mockup Background */}
            <div className={`relative w-[400px] h-[500px] transition-colors duration-500 rounded-3xl flex items-center justify-center ${{
              "white": "bg-neutral-100",
              "black": "bg-black",
              "navy": "bg-slate-900",
              "heather-grey": "bg-neutral-300",
              "red": "bg-red-600",
              "maroon": "bg-red-950",
              "forest-green": "bg-green-900",
              "royal-blue": "bg-blue-700"
            }[color] || "bg-neutral-100"}`}>
              <div className="absolute inset-0 opacity-50 flex items-center justify-center pointer-events-none">
                {/* A placeholder for the actual T-shirt texture */}
                <LayoutTemplate className={`h-64 w-64 ${["white", "heather-grey"].includes(color) ? "text-black/10" : "text-white/20"}`} />
              </div>
              
              {/* Printable Area Boundary (Visible only in edit mode conceptually) */}
              <div className="relative w-[250px] h-[350px] border-2 border-dashed border-magenta/30 mt-12 rounded-xl" onClick={() => setSelectedId(null)}>
                {elements.map((el) => (
                  <Rnd
                    key={el.id}
                    position={{ x: el.x, y: el.y }}
                    size={{ width: el.width, height: el.height }}
                    onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      updateElement(el.id, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        ...position,
                      });
                    }}
                    bounds="parent"
                    className={`${selectedId === el.id ? 'ring-2 ring-magenta' : 'hover:ring-1 hover:ring-border'}`}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedId(el.id);
                    }}
                  >
                    {el.type === 'image' && el.src && (
                      <div className="w-full h-full relative pointer-events-none">
                        <Image src={el.src} alt="Upload" fill className="object-contain" />
                      </div>
                    )}
                    {el.type === 'text' && (
                      <div 
                        className="w-full h-full flex items-center justify-center font-extrabold text-center break-words pointer-events-none"
                        style={{ color: el.color, fontSize: `${el.height * 0.4}px` }}
                      >
                        {el.text}
                      </div>
                    )}
                  </Rnd>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-background rounded-2xl p-6 shadow-sm border border-border sticky top-24">
              <h3 className="font-extrabold uppercase tracking-widest text-xl mb-6">Summary</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Premium T-Shirt</span>
                  <span>₹{basePrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Print Elements ({elements.length})</span>
                  <span>₹{elements.length * pricePerElement}</span>
                </div>
                <div className="flex justify-between font-extrabold text-2xl pt-4 border-t border-border text-magenta">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <Button 
                onClick={handleAddToCart}
                size="lg" 
                className="w-full h-14 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-extrabold text-lg uppercase tracking-widest shadow-xl"
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Estimated delivery: 5-7 business days
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
