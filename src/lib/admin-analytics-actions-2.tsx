"use server";

import { prisma } from "@/lib/prisma";

// ... existing functions (getAdvancedAnalyticsData, getAdvancedAdminOrders, getAdvancedAdminReturns, getAdvancedAdminCustomers, getAdvancedAdminProducts) ...

export async function getAdvancedAdminCoupons(startDateStr: string, endDateStr: string) {
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date range");
    }

    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    const coupons = await prisma.coupon.findMany({
      include: {
        orders: {
          where: { createdAt: dateFilter, status: { notIn: ["CANCELLED", "REFUNDED"] } }
        }
      },
      orderBy: { startDate: "desc" }
    });

    let totalCoupons = coupons.length;
    let activeCoupons = 0;
    let totalUsesInPeriod = 0;
    let totalDiscountInPeriod = 0;

    const formattedCoupons = coupons.map((c: any) => {
      const isActive = c.isActive && (!c.endDate || c.endDate > new Date());
      if (isActive) activeCoupons++;

      let usesInPeriod = c.orders?.length || 0;
      let discountInPeriod = 0;

      c.orders?.forEach((o: any) => {
        // approximate discount (subtotal + shipping - total)
        // Since we don't store exact discount amount on order, we do a rough calc or just report uses.
        // Or if we know the discount value:
        if (c.discountType === "PERCENTAGE") {
          discountInPeriod += (Number(o.subtotal) * (Number(c.discountValue) / 100));
        } else {
          discountInPeriod += Number(c.discountValue);
        }
      });

      totalUsesInPeriod += usesInPeriod;
      totalDiscountInPeriod += discountInPeriod;

      return {
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: Number(c.minOrderValue),
        isActive,
        expiresAt: c.endDate ? c.endDate.toLocaleDateString() : "Never",
        usesInPeriod,
        discountInPeriod,
        createdAt: c.startDate ? c.startDate.toLocaleDateString() : "Unknown"
      };
    });

    const summary = {
      total: totalCoupons,
      active: activeCoupons,
      usesInPeriod: totalUsesInPeriod,
      discountInPeriod: totalDiscountInPeriod
    };

    return { success: true, data: formattedCoupons, summary };
  } catch (error: any) {
    console.error("Failed to fetch admin coupons:", error);
    return { success: false, data: [], summary: { total: 0, active: 0, usesInPeriod: 0, discountInPeriod: 0 }, error: error.message };
  }
}

export async function getAdvancedAdminReviews(startDateStr: string, endDateStr: string) {
  try {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date range");
    }

    const dateFilter = {
      gte: startDate,
      lte: endDate,
    };

    const reviews = await prisma.review.findMany({
      where: { createdAt: dateFilter },
      include: {
        product: true,
        user: true,
      },
      orderBy: { createdAt: "desc" }
    });

    let totalRating = 0;
    let publishedCount = 0;
    let fiveStar = 0;

    const formattedReviews = reviews.map((r: any) => {
      totalRating += r.rating;
      if (r.isVerifiedBuyer) publishedCount++;
      if (r.rating === 5) fiveStar++;

      return {
        id: r.id,
        productName: r.product.name,
        customerName: r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || r.user.email : "Anonymous",
        rating: r.rating,
        title: r.title || "No Title",
        content: r.comment || "",
        isPublished: r.isVerifiedBuyer,
        createdAt: r.createdAt ? r.createdAt.toLocaleDateString() : "Unknown"
      };
    });

    const summary = {
      total: reviews.length,
      averageRating: reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "0.0",
      published: publishedCount,
      fiveStar
    };

    return { success: true, data: formattedReviews, summary };
  } catch (error: any) {
    console.error("Failed to fetch admin reviews:", error);
    return { success: false, data: [], summary: { total: 0, averageRating: "0.0", published: 0, fiveStar: 0 }, error: error.message };
  }
}
