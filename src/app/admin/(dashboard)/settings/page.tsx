import { SettingsManager } from "@/components/admin/settings-manager";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userProfile = null;
  if (user) {
    userProfile = await prisma.user.findUnique({ where: { authId: user.id } });
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["COD", "SEO_TITLE", "SEO_DESC", "MAINTENANCE_MODE", "RETURN_WINDOW_DAYS"] } }
  });
  
  const settingsMap = settings.reduce<Record<string, string>>((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  const codEnabled = settingsMap["COD"] === "ON";
  const maintenanceMode = settingsMap["MAINTENANCE_MODE"] === "ON";

  const adminData = {
    email: user?.email || "",
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    phone: userProfile?.phone || "",
    codEnabled,
    seoTitle: settingsMap["SEO_TITLE"] || "",
    seoDesc: settingsMap["SEO_DESC"] || "",
    maintenanceMode,
    returnWindowDays: settingsMap["RETURN_WINDOW_DAYS"] || "7"
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Manage store preferences, integrations, and security.</p>
      </div>
      <SettingsManager initialData={adminData} />
    </div>
  );
}
