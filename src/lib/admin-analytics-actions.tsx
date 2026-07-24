"use server";

import { prisma } from "@/lib/prisma";
type OrderStatus = any;

// ... previous getAdvancedAnalyticsData ...
export async function getAdvancedAnalyticsData(startDateStr: string, endDateStr: string) {
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

    // 1. Orders Data
    const orders = await prisma.order.findMany({
      where: { createdAt: dateFilter },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
        user: true,
        payment: { include: { refunds: true } },
        returns: true
      },
      orderBy: { createdAt: "asc" }
    });

    // 2. Customers Data
    const customersInPeriod = await prisma.user.count({
      where: { role: "CUSTOMER", createdAt: dateFilter }
    });
    
    const totalCustomersAllTime = await prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { lte: endDate } }
    });

    // 3. Returns Data
    const returns = await prisma.return.findMany({
      where: { createdAt: dateFilter }
    });

    // --- AGGREGATIONS ---

    let totalRevenue = 0;
    let productsSold = 0;
    let refundAmount = 0;
    let couponsUsed = 0;

    const statusCounts = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    const returnStatusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      COMPLETED: 0,
    };

    const categorySales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    const productSales: Record<string, { name: string, image: string, quantity: number, revenue: number }> = {};

    // Grouping by Date for charts
    const revenueByDate: Record<string, number> = {};
    const ordersByDate: Record<string, number> = {};
    
    // Grouping customers by date
    const customerGrowth: Record<string, number> = {};

    // Find all customers who ordered in this period
    const customersWhoOrdered = new Set();
    const repeatingCustomers = new Set();

    orders.forEach(order => {
      // Status
      if (statusCounts[order.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
      
      // Coupons
      if (order.couponId) couponsUsed++;

      // Revenue (only from non-cancelled/refunded)
      if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
        totalRevenue += Number(order.total);
        
        const dateKey = order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + Number(order.total);
        ordersByDate[dateKey] = (ordersByDate[dateKey] || 0) + 1;

        // Products and Categories
        order.items.forEach(item => {
          productsSold += item.quantity;
          
          const pName = item.productName;
          const pImage = item.customImage || (item.variant?.product as any)?.images?.[0]?.url || "";
          
          if (!productSales[pName]) productSales[pName] = { name: pName, image: pImage, quantity: 0, revenue: 0 };
          productSales[pName].quantity += item.quantity;
          productSales[pName].revenue += (Number(item.productPrice) * item.quantity);

          // For Categories, we don't store categoryId on OrderItem. Let's do a best-effort from Product if available
          if ((item.variant?.product as any)?.categoryId) {
            const catId = (item.variant?.product as any).categoryId;
            if (!categorySales[catId]) categorySales[catId] = { name: "Category " + catId.substring(0, 4), quantity: 0, revenue: 0 };
            categorySales[catId].quantity += item.quantity;
            categorySales[catId].revenue += (Number(item.productPrice) * item.quantity);
          }
        });
      }

      // Customer stats
      if (order.userId) {
        if (customersWhoOrdered.has(order.userId)) {
          repeatingCustomers.add(order.userId);
        }
        customersWhoOrdered.add(order.userId);
      }
      
      // Refunds
      if (order.payment && order.payment.refunds) {
        order.payment.refunds.forEach(r => {
          refundAmount += Number(r.amount);
        });
      }
    });

    returns.forEach(r => {
      if (returnStatusCounts[r.status as keyof typeof returnStatusCounts] !== undefined) {
        returnStatusCounts[r.status as keyof typeof returnStatusCounts]++;
      }
    });

    // Formatting chart data
    const chartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date] || 0,
      orders: ordersByDate[date] || 0
    }));

    // Formatting top products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const topCategories = Object.values(categorySales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders: orders.length,
          totalCustomers: totalCustomersAllTime,
          newCustomers: customersInPeriod,
          returningCustomers: repeatingCustomers.size,
          productsSold,
          averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
          pendingOrders: statusCounts.PENDING,
          processingOrders: statusCounts.PROCESSING + statusCounts.CONFIRMED,
          shippedOrders: statusCounts.SHIPPED + statusCounts.OUT_FOR_DELIVERY,
          deliveredOrders: statusCounts.DELIVERED,
          cancelledOrders: statusCounts.CANCELLED,
          returnRequests: returns.length,
          approvedReturns: returnStatusCounts.APPROVED,
          rejectedReturns: returnStatusCounts.REJECTED,
          refundAmount,
          couponsUsed
        },
        topProducts,
        topCategories,
        chartData
      }
    };

  } catch (error: any) {
    console.error("Failed to fetch advanced analytics:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdvancedAdminOrders(startDateStr: string, endDateStr: string) {
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

    const orders = await prisma.order.findMany({
      where: { createdAt: dateFilter },
      include: {
        user: true,
        items: true,
        payment: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate Summary Cards
    const summary = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0
    };

    const now = new Date();
    const todayStr = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    orders.forEach(o => {
      const d = o.createdAt;
      if (d.toDateString() === todayStr) summary.today++;
      if (d >= weekAgo) summary.thisWeek++;
      if (d >= monthAgo) summary.thisMonth++;
      
      if (o.status === "PENDING") summary.pending++;
      if (o.status === "CONFIRMED" || o.status === "PACKED") summary.processing++;
      if (o.status === "DELIVERED") summary.delivered++;
      if (o.status === "CANCELLED") summary.cancelled++;
    });

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || "Customer" : o.shippingAddress?.firstName || "Guest",
      customerEmail: o.user?.email || "Guest",
      createdAt: o.createdAt.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
      rawDate: o.createdAt.toISOString(),
      itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      total: Number(o.total),
      status: o.status,
      paymentMethod: o.payment?.method || "Unknown",
      paymentStatus: o.payment?.status || "PENDING",
    }));

    return { success: true, data: formattedOrders, summary };
  } catch (error: any) {
    console.error("Failed to fetch admin orders:", error);
    return { success: false, data: [], summary: { today: 0, thisWeek: 0, thisMonth: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 }, error: error.message };
  }
}

export async function getAdvancedAdminReturns(startDateStr: string, endDateStr: string) {
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

    const returns = await prisma.return.findMany({
      where: { createdAt: dateFilter },
      include: {
        order: true,
        user: true,
        orderItem: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate Summary Cards
    const summary = {
      total: returns.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      refunds: 0,
      replacements: 0
    };

    returns.forEach(r => {
      if (r.status === "PENDING") summary.pending++;
      if (r.status === "APPROVED") summary.approved++;
      if (r.status === "REJECTED") summary.rejected++;
      if (r.status === "COMPLETED") summary.completed++;
      
      if (r.type === "REFUND") summary.refunds++;
      if (r.type === "REPLACEMENT") summary.replacements++;
    });

    const formattedReturns = returns.map(r => ({
      id: r.id,
      orderNumber: r.order.orderNumber,
      orderId: r.order.id,
      customerName: r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || r.user.email : "Unknown",
      productName: r.orderItem.productName,
      type: r.type,
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
    }));

    return { success: true, data: formattedReturns, summary };
  } catch (error: any) {
    console.error("Failed to fetch admin returns:", error);
    return { success: false, data: [], summary: { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, refunds: 0, replacements: 0 }, error: error.message };
  }
}

export async function getAdvancedAdminCustomers(startDateStr: string, endDateStr: string) {
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

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        orders: {
          select: { total: true, createdAt: true, status: true },
          where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let newCustomers = 0;
    let activeCustomers = 0;

    const formattedCustomers = customers.map(c => {
      // Check if they are new in this date range
      const isNew = c.createdAt >= startDate && c.createdAt <= endDate;
      if (isNew) newCustomers++;

      // Check if they are active (placed an order in this date range)
      const ordersInPeriod = c.orders.filter(o => o.createdAt >= startDate && o.createdAt <= endDate);
      if (ordersInPeriod.length > 0) activeCustomers++;

      return {
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        email: c.email,
        phone: c.phone || "N/A",
        totalOrders: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
        isNew,
        ordersInPeriod: ordersInPeriod.length,
        spentInPeriod: ordersInPeriod.reduce((sum, o) => sum + Number(o.total), 0),
        joined: c.createdAt.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
      };
    });

    const summary = {
      total: customers.length,
      newCustomers,
      activeCustomers
    };

    return { success: true, data: formattedCustomers, summary };
  } catch (error: any) {
    console.error("Failed to fetch admin customers:", error);
    return { success: false, data: [], summary: { total: 0, newCustomers: 0, activeCustomers: 0 }, error: error.message };
  }
}

export async function getAdvancedAdminProducts(startDateStr: string, endDateStr: string) {
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

    const products = await prisma.product.findMany({
      include: {
        categories: true,
        variants: {
          include: {
            inventory: true,
            orderItems: {
              where: {
                order: {
                  createdAt: dateFilter,
                  status: { notIn: ["CANCELLED", "REFUNDED"] }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    let totalActive = 0;
    let totalOutOfStock = 0;
    let totalRevenueInPeriod = 0;
    let productsSoldInPeriod = 0;

    const formattedProducts = products.map(p => {
      if (p.isActive) totalActive++;
      
      let totalStock = 0;
      let soldInPeriod = 0;
      let revenueInPeriod = 0;

      (p as any).variants?.forEach((v: any) => {
        if (v.inventory) totalStock += v.inventory.stock;
        v.orderItems?.forEach((oi: any) => {
          soldInPeriod += oi.quantity;
          revenueInPeriod += (Number(oi.productPrice) * oi.quantity);
        });
      });

      if (totalStock === 0) totalOutOfStock++;

      totalRevenueInPeriod += revenueInPeriod;
      productsSoldInPeriod += soldInPeriod;

      return {
        id: p.id,
        name: p.name,
        category: (p as any).categories?.[0]?.name || "Uncategorized",
        price: Number(p.basePrice),
        stock: totalStock,
        status: p.isActive ? (totalStock > 0 ? "Active" : "Out of Stock") : "Draft",
        soldInPeriod,
        revenueInPeriod,
        createdAt: p.createdAt.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
      };
    });

    const summary = {
      total: products.length,
      active: totalActive,
      outOfStock: totalOutOfStock,
      productsSoldInPeriod,
      totalRevenueInPeriod
    };

    return { success: true, data: formattedProducts, summary };
  } catch (error: any) {
    console.error("Failed to fetch admin products:", error);
    return { success: false, data: [], summary: { total: 0, active: 0, outOfStock: 0, productsSoldInPeriod: 0, totalRevenueInPeriod: 0 }, error: error.message };
  }
}
