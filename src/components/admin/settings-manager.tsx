"use client";

import { useState } from "react";
import { User, Shield, Server, CreditCard, Mail, Store, Loader2, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAdminProfile, updateAdminPassword, updateStoreSetting } from "@/lib/admin-actions";
import { toast } from "@/lib/toast-store";

type Tab = "general" | "payments" | "api" | "profile" | "security";

export function SettingsManager({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [codEnabled, setCodEnabled] = useState(initialData.codEnabled || false);
  const [maintenanceMode, setMaintenanceMode] = useState(initialData.maintenanceMode || false);
  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(initialData.seoDesc || "");
  const [returnWindowDays, setReturnWindowDays] = useState(initialData.returnWindowDays || "7");
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    phone: initialData.phone,
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg("");
    const res = await updateAdminProfile(profileData);
    if (res.success) {
      setProfileMsg("Profile updated successfully");
    } else {
      setProfileMsg("Error: " + res.error);
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    setPasswordError("");
    setPasswordLoading(true);
    setPasswordMsg("");
    
    const res = await updateAdminPassword(password);
    if (res.success) {
      setPasswordMsg("Password updated successfully. You may need to log in again.");
      setPassword("");
      setConfirmPassword("");
    } else {
      setPasswordError(res.error || "Failed to update password");
    }
    setPasswordLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 space-y-2 shrink-0">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "profile" ? "bg-magenta text-white" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" /> My Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "security" ? "bg-magenta text-white" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
        >
          <Shield className="h-4 w-4" /> Security
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "general" ? "bg-magenta text-white" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
        >
          <Store className="h-4 w-4" /> Store Details
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "payments" ? "bg-magenta text-white" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Payments & Taxes
        </button>
        <button
          onClick={() => setActiveTab("api")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "api" ? "bg-magenta text-white" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`}
        >
          <Server className="h-4 w-4" /> API Integrations
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 min-h-[500px]">
        {activeTab === "profile" && (
          <div className="max-w-xl">
            <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6 border-b border-border pb-4">Admin Profile</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email Address (Read Only)</label>
                <input 
                  type="email" 
                  value={initialData.email} 
                  disabled
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-muted-foreground font-medium cursor-not-allowed" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={profileData.firstName}
                    onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl px-4 py-3 font-medium transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={profileData.lastName}
                    onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl px-4 py-3 font-medium transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl px-4 py-3 font-medium transition-all" 
                />
              </div>

              {profileMsg && (
                <div className="p-3 bg-success/10 border border-success/20 text-success text-xs font-bold uppercase rounded-lg">
                  {profileMsg}
                </div>
              )}

              <Button type="submit" disabled={profileLoading} className="h-12 px-8 rounded-xl font-extrabold uppercase tracking-widest bg-magenta hover:bg-magenta/90 text-white">
                {profileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Profile"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-xl">
            <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6 border-b border-border pb-4">Security & Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl pl-12 pr-4 py-3 font-medium transition-all" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl pl-12 pr-4 py-3 font-medium transition-all" 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase rounded-lg">
                  {passwordError}
                </div>
              )}
              {passwordMsg && (
                <div className="p-3 bg-success/10 border border-success/20 text-success text-xs font-bold uppercase rounded-lg">
                  {passwordMsg}
                </div>
              )}

              <Button type="submit" disabled={passwordLoading} className="h-12 px-8 rounded-xl font-extrabold uppercase tracking-widest bg-magenta hover:bg-magenta/90 text-white">
                {passwordLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "general" && (
          <div className="max-w-xl space-y-8">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6 border-b border-border pb-4 flex items-center justify-between">
                Store Details <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground">Configured in DB</span>
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Store Name</label>
                  <input type="text" disabled value="ORINKO" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground font-extrabold cursor-not-allowed opacity-70" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Support Email</label>
                  <input type="text" disabled value="support@orinko.in" className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-muted-foreground font-medium cursor-not-allowed opacity-70" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Return Window (Days)</label>
                  <input 
                    type="number" 
                    value={returnWindowDays}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setReturnWindowDays(val);
                      setSettingsLoading(true);
                      await updateStoreSetting("RETURN_WINDOW_DAYS", val);
                      setSettingsLoading(false);
                    }}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl px-4 py-3 font-medium transition-all" 
                  />
                  <p className="text-xs text-muted-foreground mt-2">Number of days after delivery a customer can request a return or replacement.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6 border-b border-border pb-4 mt-8">
                SEO Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Meta Title</label>
                  <input 
                    type="text" 
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl px-4 py-3 font-medium transition-all" 
                    placeholder="ORINKO | Premium Fashion"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Meta Description</label>
                  <textarea 
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border focus:border-magenta focus:ring-1 focus:ring-magenta outline-none rounded-xl px-4 py-3 font-medium transition-all resize-none" 
                    placeholder="Premium streetwear brand focusing on quality fits."
                  />
                </div>
                <Button 
                  onClick={async () => {
                    setSettingsLoading(true);
                    await updateStoreSetting("SEO_TITLE", seoTitle);
                    await updateStoreSetting("SEO_DESC", seoDesc);
                    setSettingsLoading(false);
                    toast.success("SEO Settings saved!");
                  }}
                  disabled={settingsLoading} 
                  className="h-10 px-6 rounded-xl font-extrabold uppercase tracking-widest bg-magenta hover:bg-magenta/90 text-white"
                >
                  {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save SEO Settings"}
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight mb-6 border-b border-border pb-4 mt-8">
                Store Status
              </h2>
              <div className="p-5 bg-destructive/5 rounded-2xl border border-destructive/20 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-destructive">Maintenance Mode</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Show maintenance screen to non-admins</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setSettingsLoading(true);
                    const nextVal = !maintenanceMode;
                    const res = await updateStoreSetting("MAINTENANCE_MODE", nextVal ? "ON" : "OFF");
                    if (res.success) {
                      setMaintenanceMode(nextVal);
                    } else {
                      toast.error("Failed to update: " + res.error);
                    }
                    setSettingsLoading(false);
                  }}
                  disabled={settingsLoading}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    maintenanceMode ? "bg-destructive" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      maintenanceMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="max-w-xl space-y-8">
            <h2 className="text-xl font-extrabold uppercase tracking-tight border-b border-border pb-4">Integrations Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center">
                    <Database className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase">Supabase (Database & Auth)</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Environment variables configured</p>
                  </div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>

              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase">Cloudinary (Media)</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Ready for product uploads</p>
                  </div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>

              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase">Resend (Emails)</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Transactional emails ready</p>
                  </div>
                </div>
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="max-w-xl space-y-8">
            <h2 className="text-xl font-extrabold uppercase tracking-tight border-b border-border pb-4">Payments & Fees</h2>
            
            <div className="space-y-6">
              {/* COD Toggle Block */}
              <div className="p-5 bg-secondary/30 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Allow customers to choose cash on delivery during checkout</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setSettingsLoading(true);
                    const nextVal = !codEnabled;
                    const res = await updateStoreSetting("COD", nextVal ? "ON" : "OFF");
                    if (res.success) {
                      setCodEnabled(nextVal);
                    } else {
                      toast.error("Failed to update setting: " + res.error);
                    }
                    setSettingsLoading(false);
                  }}
                  disabled={settingsLoading}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    codEnabled ? "bg-magenta" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      codEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-6 opacity-70">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Active Payment Gateway</h4>
                  <div className="font-extrabold text-xl text-foreground">Razorpay</div>
                  <p className="text-xs font-medium text-muted-foreground mt-2">All INR payments are routed through your configured Razorpay keys.</p>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Default Tax Rate</h4>
                  <div className="font-extrabold text-xl text-foreground">0%</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Default Shipping</h4>
                  <div className="font-extrabold text-xl text-foreground">₹0.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function Database(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
  );
}
function Cloud(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
  );
}
