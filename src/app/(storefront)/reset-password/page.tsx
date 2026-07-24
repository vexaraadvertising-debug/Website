"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/(storefront)/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const res = await updatePassword(formData);

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSuccess(res.success);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center pt-16 md:pt-20 pb-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-magenta/10 flex items-center justify-center text-magenta">
            <Lock className="h-6 w-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight uppercase">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm border border-border sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <p className="text-sm font-medium text-foreground">{success}</p>
              <Link href="/login">
                <Button className="w-full mt-4 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-foreground">
                  New Password
                </label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-foreground">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-magenta hover:text-white font-bold uppercase tracking-widest"
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
