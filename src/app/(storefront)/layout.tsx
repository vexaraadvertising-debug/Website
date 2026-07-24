import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getMaintenanceMode } from "@/lib/actions";
import { MaintenanceScreen } from "@/components/maintenance-screen";
import { NewsletterPopup } from "@/components/storefront/newsletter-popup";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMaintenanceMode = await getMaintenanceMode();

  if (isMaintenanceMode) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <MaintenanceScreen />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <NewsletterPopup />
    </>
  );
}
