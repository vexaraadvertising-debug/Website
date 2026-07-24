"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getUserRole } from "@/lib/rbac";

export async function searchAdminAction(query: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  const role = await getUserRole(authData.user, supabase);
  if (role !== "admin" && role !== "super_admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const q = query.trim().toLowerCase();
    
    // Search Products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 3,
      select: { id: true, name: true, slug: true }
    });

    // Search Orders
    const orders = await prisma.order.findMany({
      where: {
        orderNumber: { contains: q, mode: 'insensitive' }
      },
      take: 3,
      select: { id: true, orderNumber: true, status: true }
    });

    // Search Users (Customers)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 3,
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    const results = [
      ...products.map(p => ({
        id: p.id,
        type: "PRODUCT",
        title: p.name,
        subtitle: `Slug: ${p.slug}`
      })),
      ...orders.map(o => ({
        id: o.id,
        type: "ORDER",
        title: `Order #${o.orderNumber}`,
        subtitle: `Status: ${o.status}`
      })),
      ...users.map(u => ({
        id: u.id,
        type: "CUSTOMER",
        title: `${u.firstName} ${u.lastName}`.trim() || 'Unknown',
        subtitle: u.email
      }))
    ];

    return { success: true, data: results };
  } catch (error: any) {
    console.error("Admin search error:", error);
    return { success: false, error: error.message };
  }
}
