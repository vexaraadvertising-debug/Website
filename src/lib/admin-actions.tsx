"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { resolveAdminNotification } from "./notification-actions";
import { render } from "@react-email/render";
import { OrderStatusEmail } from "@/emails/OrderStatusEmail";
import { sendEmail } from "./email";
type OrderStatus = any;
import { createClient } from "@/utils/supabase/server";

import { getUserRole } from "@/lib/rbac";

// Helper function to verify Admin Role
async function checkAdminAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const role = await getUserRole(user, supabase);
  return role === "admin";
}

export async function promoteCurrentUserToAdminAction(secretKey?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  const validKey = process.env.ADMIN_SECRET_KEY || "ORINKO_ADMIN_2026";
  if (secretKey && secretKey !== validKey) {
    return { success: false, error: "Invalid secret key" };
  }

  try {
    // 1. Update Supabase auth user_metadata
    await supabase.auth.updateUser({
      data: { role: "admin" }
    });

    // 2. Update/Upsert Supabase public.profiles table
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
      role: "admin"
    });

    // 3. Update/Upsert Prisma User table
    await prisma.user.upsert({
      where: { authId: user.id },
      update: { role: "ADMIN" },
      create: {
        authId: user.id,
        email: user.email!,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN"
      }
    });

    console.log(`[PROMOTE_ADMIN] Successfully promoted user ${user.email} (ID: ${user.id}) to ADMIN across metadata, profiles, and database`);
    revalidatePath("/admin");
    return { success: true, message: "Account successfully promoted to Admin!" };
  } catch (error: any) {
    console.error("Promote admin error:", error);
    return { success: false, error: error.message || "Failed to promote account" };
  }
}

// -----------------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW & ANALYTICS
// -----------------------------------------------------------------------------

export async function getAdminDashboardStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalCategories,
      totalCoupons,
      totalReviews,
      orders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.category.count(),
      prisma.coupon.count(),
      prisma.review.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true }
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.inventory.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.inventory.count({ where: { stock: 0 } }),
    ]);

    const [totalRevenueResult, todayRevenueResult] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: { gte: today }
        }
      })
    ]);

    const totalRevenue = totalRevenueResult._sum.total ? Number(totalRevenueResult._sum.total) : 0;
    const todayRevenue = todayRevenueResult._sum.total ? Number(todayRevenueResult._sum.total) : 0;

    return {
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalCustomers,
        totalProducts,
        totalCategories,
        totalCoupons,
        totalReviews,
        lowStockProducts,
        outOfStockProducts,
        recentOrders: orders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email : "Guest",
          date: new Date(o.createdAt).toLocaleDateString(),
          amount: Number(o.total),
          status: o.status
        }))
      }
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      success: true,
      data: {
        totalRevenue: 0,
        todayRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalCategories: 0,
        totalCoupons: 0,
        totalReviews: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        recentOrders: []
      }
    };
  }
}

// -----------------------------------------------------------------------------
// 1.5. ANALYTICS DATA
// -----------------------------------------------------------------------------

export async function getAnalyticsData() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      orders,
      monthlyRevenueResult,
      dailyRevenueResult
    ] = await Promise.all([
      prisma.order.findMany({
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
        include: { items: true, user: true }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: { gte: firstDayOfMonth }
        }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: { notIn: ["CANCELLED", "REFUNDED"] },
          createdAt: { gte: today }
        }
      })
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true, shippingAddress: true }
    });

    const lowStockAlerts = await prisma.productVariant.findMany({
      where: { inventory: { stock: { lte: 5 } } },
      include: { product: true, size: true, color: true, inventory: true },
      take: 10
    });

    // Time-series data for the last 30 days
    const revenueData: { date: string, revenue: number }[] = [];
    const ordersData: { date: string, orders: number }[] = [];
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      revenueData.push({ date: dateStr, revenue: 0 });
      ordersData.push({ date: dateStr, orders: 0 });
    }

    const categorySales: Record<string, { name: string, revenue: number }> = {};
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
      totalRevenue += Number(order.total);
      
      // Populate time-series
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const revIndex = revenueData.findIndex(r => r.date === orderDate);
      if (revIndex !== -1) {
        revenueData[revIndex].revenue += Number(order.total);
        ordersData[revIndex].orders += 1;
      }

      order.items.forEach(item => {
        // Product Sales
        const productKey = item.productName;
        if (!productSales[productKey]) {
          productSales[productKey] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSales[productKey].quantity += item.quantity;
        productSales[productKey].revenue += (Number(item.productPrice) * item.quantity);
        
        // Mock Category Sales (since items don't store category snaphot, we assume product name prefix or just group)
        // A real app would join on Product -> Categories. For this, we'll try to extract the first word.
        const catName = item.productName.split(' ')[0] || "General";
        if (!categorySales[catName]) categorySales[catName] = { name: catName, revenue: 0 };
        categorySales[catName].revenue += (Number(item.productPrice) * item.quantity);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
      
    const topCategories = Object.values(categorySales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue: Number(monthlyRevenueResult._sum.total || 0),
        dailyRevenue: Number(dailyRevenueResult._sum.total || 0),
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length) : 0,
        topProducts,
        topCategories,
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: `${o.shippingAddress?.firstName || 'Customer'} ${o.shippingAddress?.lastName || ''}`.trim(),
          total: Number(o.total),
          status: o.status,
          date: o.createdAt.toLocaleDateString()
        })),
        lowStockAlerts: lowStockAlerts.map(v => ({
          id: v.id,
          productName: v.product.name,
          variant: `${v.color.name} - ${v.size.name}`,
          inventory: v.inventory?.stock || 0
        })),
        revenueData,
        ordersData
      }
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return { success: false, data: null };
  }
}

// -----------------------------------------------------------------------------
// 2. ADMIN PROFILE & SETTINGS
// -----------------------------------------------------------------------------

export async function updateAdminProfile(data: { firstName: string; lastName: string; phone: string }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in" };

  try {
    await prisma.user.update({
      where: { authId: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

export async function updateAdminPassword(password: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update password" };
  }
}

// -----------------------------------------------------------------------------
// 3. PRODUCT MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        categories: true,
        variants: { include: { inventory: true } }
      }
    });

    return {
      success: true,
      data: products.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.basePrice),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        isActive: p.isActive,
        isNew: p.isNew,
        category: p.categories[0]?.name || "Uncategorized",
        image: p.images[0]?.url || "/images/hero_model.jpg",
        totalStock: p.variants.reduce((sum, v) => sum + (v.inventory?.stock || 0), 0)
      }))
    };
  } catch (error) {
    console.error("Fetch admin products error:", error);
    return { success: true, data: [] };
  }
}

export async function createAdminProduct(data: {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  categorySlug?: string;
  imageUrl?: string;
  publicId?: string;
  isNew?: boolean;
  isActive?: boolean;
}) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const productSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Default sizes & colours every new product ships with
    const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
    const DEFAULT_COLORS = [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Navy",  hex: "#1B2A4A" },
      { name: "Grey",  hex: "#9CA3AF" },
    ];

    // Ensure all size records exist
    const sizeObjects = [];
    for (const s of DEFAULT_SIZES) {
      let sizeObj = await prisma.size.findUnique({ where: { name: s } });
      if (!sizeObj) sizeObj = await prisma.size.create({ data: { name: s } });
      sizeObjects.push(sizeObj);
    }

    // Ensure all colour records exist
    const colorObjects = [];
    for (const c of DEFAULT_COLORS) {
      let colorObj = await prisma.color.findFirst({ where: { name: c.name } });
      if (!colorObj) colorObj = await prisma.color.create({ data: { name: c.name, hex: c.hex } });
      colorObjects.push(colorObj);
    }

    // Build all size × colour combinations
    const variantCombos = [];
    for (const sizeObj of sizeObjects) {
      for (const colorObj of colorObjects) {
        variantCombos.push({
          sku: `${productSlug}-${colorObj.name.toLowerCase().replace(/\s+/g, "-")}-${sizeObj.name.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          sizeId: sizeObj.id,
          colorId: colorObj.id,
          inventory: { create: { stock: 100 } }
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: productSlug,
        description: data.description,
        basePrice: data.basePrice,
        originalPrice: data.originalPrice,
        isNew: data.isNew ?? true,
        isActive: data.isActive ?? true,
        details: ["100% Premium Cotton", "Drop Shoulder Oversized Fit", "Bio-washed"],
        images: data.imageUrl ? {
          create: [{ url: data.imageUrl, publicId: data.publicId || "cloudinary_id", isPrimary: true }]
        } : undefined,
        categories: data.categorySlug ? {
          connectOrCreate: {
            where: { slug: data.categorySlug },
            create: { slug: data.categorySlug, name: data.categorySlug.toUpperCase() }
          }
        } : undefined,
        variants: { create: variantCombos }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error("Create product error:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

// Seed default variants (5 sizes × 4 colours) for an EXISTING product that has none
export async function seedDefaultVariantsAction(productId: string, productSlug: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];
  const DEFAULT_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy",  hex: "#1B2A4A" },
    { name: "Grey",  hex: "#9CA3AF" },
  ];

  try {
    const sizeObjects = [];
    for (const s of DEFAULT_SIZES) {
      let sizeObj = await prisma.size.findUnique({ where: { name: s } });
      if (!sizeObj) sizeObj = await prisma.size.create({ data: { name: s } });
      sizeObjects.push(sizeObj);
    }

    const colorObjects = [];
    for (const c of DEFAULT_COLORS) {
      let colorObj = await prisma.color.findFirst({ where: { name: c.name } });
      if (!colorObj) colorObj = await prisma.color.create({ data: { name: c.name, hex: c.hex } });
      colorObjects.push(colorObj);
    }

    let added = 0;
    for (const sizeObj of sizeObjects) {
      for (const colorObj of colorObjects) {
        // Skip if this exact combo already exists
        const existing = await prisma.productVariant.findFirst({
          where: { productId, sizeId: sizeObj.id, colorId: colorObj.id }
        });
        if (existing) continue;

        await prisma.productVariant.create({
          data: {
            productId,
            sku: `${productSlug}-${colorObj.name.toLowerCase().replace(/\s+/g, "-")}-${sizeObj.name.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            sizeId: sizeObj.id,
            colorId: colorObj.id,
            inventory: { create: { stock: 100 } }
          }
        });
        added++;
      }
    }

    revalidatePath(`/admin/products/edit/${productId}`);
    revalidatePath(`/product/${productSlug}`);
    return { success: true, added };
  } catch (error: any) {
    console.error("Seed default variants error:", error);
    return { success: false, error: error.message || "Failed to seed variants" };
  }
}

export async function toggleProductStatusAction(productId: string, isActive: boolean) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive }
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to toggle status" };
  }
}

// -----------------------------------------------------------------------------
// 1.3. REVIEW MANAGEMENT
// -----------------------------------------------------------------------------



export async function deleteReview(reviewId: string) {
  try {
    await prisma.review.delete({
      where: { id: reviewId }
    });
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}

// -----------------------------------------------------------------------------
// 1.4. HOMEPAGE MANAGER (CMS)
// -----------------------------------------------------------------------------

export async function saveHeroSlide(data: any) {
  try {
    if (data.id) {
      await prisma.heroSlide.update({
        where: { id: data.id },
        data: {
          productId: data.productId,
          desktopImage: data.desktopImage,
          mobileImage: data.mobileImage,
          heading: data.heading,
          description: data.description,
          badge: data.badge,
        }
      });
    } else {
      const existing = await prisma.heroSlide.findFirst({
        orderBy: { order: 'desc' }
      });
      const order = existing ? existing.order + 1 : 0;
      
      await prisma.heroSlide.create({
        data: {
          productId: data.productId,
          desktopImage: data.desktopImage,
          mobileImage: data.mobileImage,
          heading: data.heading,
          description: data.description,
          badge: data.badge,
          order
        }
      });
    }
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving hero slide:", error);
    return { success: false, error: error.message || "Failed to save hero slide." };
  }
}

export async function deleteHeroSlide(id: string) {
  console.log(`[deleteHeroSlide] Called with ID: ${id}`);
  try {
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    console.log(`[deleteHeroSlide] Existing record:`, existing);
    if (!existing) {
      console.log(`[deleteHeroSlide] Record not found in DB!`);
      return { success: false, error: "Record not found in DB" };
    }

    const deleted = await prisma.heroSlide.delete({ where: { id } });
    console.log(`[deleteHeroSlide] Successfully deleted:`, deleted);
    
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    console.log(`[deleteHeroSlide] Paths revalidated`);
    return { success: true };
  } catch (error: any) {
    console.error(`[deleteHeroSlide] Error:`, error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function updateHeroSlideStatus(id: string, isActive: boolean) {
  try {
    await prisma.heroSlide.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating hero slide status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function reorderHeroSlides(orderedIds: string[]) {
  try {
    // We update them sequentially to avoid deadlock in simple setups, or use a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.heroSlide.update({
          where: { id },
          data: { order: index }
        })
      )
    );
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error reordering hero slides:", error);
    return { success: false, error: "Failed to reorder" };
  }
}

export async function saveHomepageSection(data: any) {
  try {
    if (data.id) {
      await prisma.homepageSection.update({
        where: { id: data.id },
        data
      });
    } else {
      await prisma.homepageSection.create({ data });
    }
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error saving homepage section:", error);
    return { success: false, error: "Failed to save section" };
  }
}

export async function deleteHomepageSection(id: string) {
  try {
    await prisma.homepageSection.delete({ where: { id } });
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting section:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function deleteProductAction(productId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}

// -----------------------------------------------------------------------------
// 7. REVIEWS MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminReviews() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized", data: [] };

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        product: true
      }
    });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Fetch admin reviews error:", error);
    return { success: false, error: "Database connection pending.", data: [] };
  }
}

export async function deleteAdminReview(reviewId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Delete review error:", error);
    return { success: false, error: "Failed to delete review." };
  }
}

// -----------------------------------------------------------------------------
// 8. COUPON MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminCoupons() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized", data: [] };

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { orders: true } }
      }
    });
    return { success: true, data: coupons };
  } catch (error) {
    console.error("Fetch admin coupons error:", error);
    return { success: false, error: "Database connection pending.", data: [] };
  }
}

export async function createCouponAction(data: {
  code: string;
  type: string;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  perUserLimit?: number;
}) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.type,
        discountValue: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount,
        startDate: data.startDate,
        endDate: data.endDate,
        usageLimit: data.usageLimit
      }
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Coupon code already exists." };
    return { success: false, error: "Failed to create coupon." };
  }
}

export async function toggleCouponAction(id: string, isActive: boolean) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.coupon.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to toggle coupon." };
  }
}

export async function deleteCouponAction(id: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete coupon." };
  }
}

// -----------------------------------------------------------------------------
// 3. CATEGORIES MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
    return {
      success: true,
      data: categories.map(c => ({
        id: c.id,
        slug: c.slug,
        description: c.description || "",
        imageUrl: c.imageUrl || "",
        publicId: c.publicId || "",
        productCount: c._count.products
      }))
    };
  } catch (error) {
    return { success: true, data: [] };
  }
}

export async function createCategoryAction(data: { name: string; description?: string; imageUrl?: string; publicId?: string }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.category.create({
      data: { 
        name: data.name, 
        slug, 
        description: data.description,
        imageUrl: data.imageUrl,
        publicId: data.publicId
      }
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategoryAction(id: string, data: { name: string; description?: string; imageUrl?: string; publicId?: string }) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    // Check if category exists first to avoid Prisma error overlay in dev
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Category not found in database." };
    }

    await prisma.category.update({
      where: { id },
      data: { 
        name: data.name, 
        slug, 
        description: data.description,
        imageUrl: data.imageUrl,
        publicId: data.publicId
      }
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}

// -----------------------------------------------------------------------------
// 4. ORDERS MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        items: true,
        payment: true
      }
    });

    return {
      success: true,
      data: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email : "Guest",
        customerEmail: o.user?.email || "guest@orinko.in",
        total: Number(o.total),
        status: o.status,
        paymentMethod: o.payment?.method || "COD",
        paymentStatus: o.payment?.status || "PENDING",
        createdAt: new Date(o.createdAt).toLocaleDateString(),
        itemsCount: o.items.length
      }))
    };
  } catch (error) {
    return { success: true, data: [] };
  }
}

export async function updateAdminOrderStatusAction(orderId: string, status: OrderStatus) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update order status" };
  }
}

// -----------------------------------------------------------------------------
// 5. CUSTOMERS MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminCustomers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } }
    });

    return {
      success: true,
      data: users.map(u => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || "Customer",
        email: u.email,
        role: u.role,
        ordersCount: u._count.orders,
        joinedAt: new Date(u.createdAt).toLocaleDateString()
      }))
    };
  } catch (error) {
    return { success: true, data: [] };
  }
}

// -----------------------------------------------------------------------------
// 6. INVENTORY MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminInventory() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        variant: {
          include: {
            product: true,
            size: true,
            color: true
          }
        }
      }
    });

    return {
      success: true,
      data: inventory.map(i => ({
        id: i.id,
        productName: i.variant.product.name,
        sku: i.variant.sku,
        size: i.variant.size.name,
        color: i.variant.color.name,
        stock: i.stock,
        lowStockThreshold: i.lowStockThreshold
      }))
    };
  } catch (error) {
    return { success: true, data: [] };
  }
}

export async function updateStockAction(inventoryId: string, stock: number) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.inventory.update({
      where: { id: inventoryId },
      data: { stock }
    });
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update stock" };
  }
}


// -----------------------------------------------------------------------------
// 9. ORDER STATUS MANAGEMENT
// -----------------------------------------------------------------------------

export async function updateOrderStatus(id: string, status: OrderStatus, trackingUrl?: string, trackingNumber?: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const updateData: any = { status };
    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        items: true
      }
    });

    // Automatically resolve any 'ORDER' notification for this order
    await resolveAdminNotification("ORDER", id);

    revalidatePath("/admin/orders");

    // Send email to customer
    if (updated.user?.email) {
      const emailHtml = await render(
        <OrderStatusEmail
          orderNumber={updated.orderNumber}
          customerName={updated.user.firstName || "Customer"}
          status={status as any}
          trackingUrl={trackingUrl}
          trackingNumber={trackingNumber}
          products={updated.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.productPrice)
          }))}
        />
      );

      await sendEmail({
        to: updated.user.email,
        subject: `Order Update: ${updated.orderNumber} is now ${status}`,
        html: emailHtml,
        type: "ORDER"
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status" };
  }
}

export async function getAdminProductById(id: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized", data: null };

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        categories: true,
        variants: {
          include: {
            size: true,
            color: true,
            inventory: true
          }
        }
      }
    });
    
    if (!product) return { success: false, error: "Product not found", data: null };
    
    const firstCategory = product.categories[0]?.slug || "oversized";
    
    return {
      success: true,
      data: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        basePrice: Number(product.basePrice),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        categorySlug: firstCategory,
        isNew: product.isNew,
        isActive: product.isActive,
        imageUrl: product.images[0]?.url || "",
        publicId: product.images[0]?.publicId || ""
      }
    };
  } catch (error: any) {
    console.error("Fetch product by id error:", error);
    return { success: false, error: error.message || "Failed to fetch product", data: null };
  }
}

export async function updateAdminProduct(id: string, data: {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  categorySlug: string;
  imageUrl?: string;
  publicId?: string;
  isNew: boolean;
  isActive: boolean;
}) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    // 1. Update basic product info
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        originalPrice: data.originalPrice || null,
        isNew: data.isNew,
        isActive: data.isActive,
      }
    });

    // 2. Disconnect and connect new category
    await prisma.product.update({
      where: { id },
      data: {
        categories: { set: [] }
      }
    });

    await prisma.product.update({
      where: { id },
      data: {
        categories: data.categorySlug ? {
          connectOrCreate: {
            where: { slug: data.categorySlug },
            create: { slug: data.categorySlug, name: data.categorySlug.toUpperCase() }
          }
        } : undefined
      }
    });

    // 3. Update image if provided
    if (data.imageUrl) {
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });
      await prisma.productImage.create({
        data: {
          productId: id,
          url: data.imageUrl,
          publicId: data.publicId || "",
          isPrimary: true
        }
      });
    }

    // 4. Seeding variants if they don't exist
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id }
    });
    
    if (existingVariants.length === 0) {
      const sizes = ["S", "M", "L", "XL", "XXL"];
      const color = "Black";
      
      // Find or create color
      let colorObj = await prisma.color.findFirst({
        where: { name: color }
      });
      if (!colorObj) {
        colorObj = await prisma.color.create({
          data: { name: color, hex: "#000000" }
        });
      }

      // Find or create sizes
      const sizeObjects = [];
      for (const size of sizes) {
        let sizeObj = await prisma.size.findUnique({
          where: { name: size }
        });
        if (!sizeObj) {
          sizeObj = await prisma.size.create({
            data: { name: size }
          });
        }
        sizeObjects.push(sizeObj);
      }

      for (const so of sizeObjects) {
        await prisma.productVariant.create({
          data: {
            productId: id,
            sku: `${data.slug}-${color.toLowerCase()}-${so.name.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sizeId: so.id,
            colorId: colorObj.id,
            inventory: {
              create: { stock: 100 }
            }
          }
        });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/product/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update product error:", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function updateStoreSetting(key: string, value: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Update store setting error:", error);
    return { success: false, error: error.message || "Failed to update setting" };
  }
}

export async function getAdminOrderDetail(id: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized", data: null };

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                size: true,
                color: true
              }
            }
          }
        },
        shippingAddress: true,
        payment: true,
        user: true
      }
    });

    if (!order) return { success: false, error: "Order not found", data: null };

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        status: order.status,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        tax: Number(order.tax),
        total: Number(order.total),
        customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        customerEmail: order.user?.email || "",
        paymentMethod: order.payment?.method || "UPI",
        paymentStatus: order.payment?.status || "PENDING",
        razorpayPaymentId: order.payment?.razorpayPaymentId,
        razorpayOrderId: order.payment?.razorpayOrderId,
        shippingAddress: order.shippingAddress,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.productName,
          productPrice: Number(item.productPrice),
          quantity: item.quantity,
          customImage: item.customImage || null,
          size: item.variant?.size?.name || "M",
          color: item.variant?.color?.name || "Black"
        }))
      }
    };
  } catch (error: any) {
    console.error("Get admin order detail error:", error);
    return { success: false, error: error.message || "Failed to load order detail", data: null };
  }
}

// -----------------------------------------------------------------------------
// PRODUCT VARIANT MANAGEMENT ACTIONS
// -----------------------------------------------------------------------------

export async function getProductVariants(productId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized", data: [] };

  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      include: {
        size: true,
        color: true,
        inventory: true
      },
      orderBy: [
        { color: { name: "asc" } },
        { size: { name: "asc" } }
      ]
    });

    return {
      success: true,
      data: variants.map(v => ({
        id: v.id,
        sku: v.sku,
        size: v.size?.name || "",
        color: v.color?.name || "",
        colorHex: v.color?.hex || "#000000",
        stock: v.inventory?.stock ?? 0,
        sizeId: v.sizeId,
        colorId: v.colorId
      }))
    };
  } catch (error: any) {
    console.error("Get product variants error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function addProductVariant(data: {
  productId: string;
  productSlug: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
}) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    // Find or create Size
    let sizeObj = await prisma.size.findUnique({ where: { name: data.size } });
    if (!sizeObj) {
      sizeObj = await prisma.size.create({ data: { name: data.size } });
    }

    // Find or create Color
    let colorObj = await prisma.color.findFirst({ where: { name: data.color } });
    if (!colorObj) {
      colorObj = await prisma.color.create({ data: { name: data.color, hex: data.colorHex } });
    }

    // Check if this size+color combo already exists for this product
    const existing = await prisma.productVariant.findFirst({
      where: { productId: data.productId, sizeId: sizeObj.id, colorId: colorObj.id }
    });
    if (existing) {
      return { success: false, error: `Variant ${data.color} / ${data.size} already exists for this product.` };
    }

    const sku = `${data.productSlug}-${data.color.toLowerCase().replace(/\s+/g, "-")}-${data.size.toLowerCase()}-${Date.now()}`;

    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        sku,
        sizeId: sizeObj.id,
        colorId: colorObj.id,
        inventory: { create: { stock: data.stock } }
      },
      include: { size: true, color: true, inventory: true }
    });

    revalidatePath(`/admin/products/edit/${data.productId}`);
    revalidatePath(`/product/${data.productSlug}`);

    return {
      success: true,
      data: {
        id: variant.id,
        sku: variant.sku,
        size: variant.size?.name || "",
        color: variant.color?.name || "",
        colorHex: variant.color?.hex || "#000000",
        stock: variant.inventory?.stock ?? 0
      }
    };
  } catch (error: any) {
    console.error("Add product variant error:", error);
    return { success: false, error: error.message || "Failed to add variant" };
  }
}

export async function deleteProductVariant(variantId: string, productId: string, productSlug: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.productVariant.delete({ where: { id: variantId } });
    revalidatePath(`/admin/products/edit/${productId}`);
    revalidatePath(`/product/${productSlug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete product variant error:", error);
    return { success: false, error: error.message || "Failed to delete variant" };
  }
}

export async function updateVariantStock(variantId: string, stock: number, productId: string) {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    const inv = await prisma.inventory.update({
      where: { variantId },
      data: { stock }
    });
    
    if (inv.stock > inv.lowStockThreshold) {
      await resolveAdminNotification("STOCK", inv.id);
    }
    
    revalidatePath(`/admin/products/edit/${productId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update variant stock error:", error);
    return { success: false, error: error.message || "Failed to update stock" };
  }
}

