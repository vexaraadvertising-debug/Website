"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await adminLogin(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-magenta/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative h-28 w-80 flex items-center overflow-hidden">
            <Image 
              src="/images/logo.png" 
              alt="ORINKO Logo" 
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white uppercase">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Restricted Access Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl border border-neutral-800 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
                <div className="text-sm font-bold text-destructive uppercase tracking-wide leading-relaxed">
                  {error}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-neutral-800 rounded-xl bg-neutral-950 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-magenta focus:border-transparent font-medium"
                  placeholder="admin@orinko.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 border border-neutral-800 rounded-xl bg-neutral-950 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-magenta focus:border-transparent font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-magenta hover:bg-magenta/90 text-white rounded-xl font-extrabold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Authenticate <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
