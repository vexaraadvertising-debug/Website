"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { login, signInWithGoogle } from "../auth/actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast-store";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await login(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 pt-16 md:pt-20 pb-16">
      <div className="bg-background rounded-3xl p-8 md:p-10 shadow-sm border border-border w-full max-w-md">
        
        <div className="flex justify-center mb-6">
          <Link href="/">
            <div className="relative h-28 w-80 flex items-center overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="ORINKO Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground font-medium text-sm">
            Sign in to your ORINKO account
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-lg text-center">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-magenta outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-magenta hover:underline">
                Forgot password?
              </Link>
            </div>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-magenta outline-none font-medium"
            />
          </div>

          <Button 
            type="submit" 
            disabled={pending}
            className="w-full h-12 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-extrabold uppercase tracking-widest rounded-xl transition-all"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
          </Button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase">Or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => signInWithGoogle()}
            className="w-full h-12 font-extrabold uppercase tracking-widest rounded-xl border-2 hover:bg-secondary/50"
          >
            Sign in with Google
          </Button>

          <p className="text-center text-sm font-medium text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-black dark:text-white font-extrabold hover:underline">
              Sign Up
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
