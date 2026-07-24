import { getAdminCategories } from "@/lib/admin-actions";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const res = await getAdminCategories();
  const categories = res.data;

  return (
    <CategoryManager initialCategories={categories} />
  );
}
