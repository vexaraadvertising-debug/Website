"use server";

type OrderStatus = any;
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminNotification } from "@/lib/notification-actions";
import Razorpay from "razorpay";
import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import crypto from "crypto";

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

// -----------------------------------------------------------------------------
// PRODUCT & CATEGORY ACTIONS
// -----------------------------------------------------------------------------

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Database connection pending.", data: [] };
  }
}

export async function getProducts(categorySlug?: string, searchQuery?: string) {
  try {
    let where: any = { isActive: true };
    
    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } };
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { slug: { contains: searchQuery, mode: "insensitive" } }
      ];
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        variants: {
          include: { size: true, color: true }
        }
      }
    });
    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, error: "Database connection pending." };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: {
          include: { size: true, color: true, inventory: true }
        },
        reviews: {
          include: { user: true, images: true }
        }
      }
    });
    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { success: false, error: "Database connection pending." };
  }
}

// -----------------------------------------------------------------------------
// CHECKOUT & ORDERS ACTIONS
// -----------------------------------------------------------------------------

export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingUrl?: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true }
    });

    if (updatedOrder && updatedOrder.user?.email) {
      if (status === "CONFIRMED" || status === "SHIPPED" || status === "DELIVERED") {
        const { render } = await import("@react-email/render");
        const { OrderStatusEmail } = await import("@/emails/OrderStatusEmail");
        const { sendEmail } = await import("@/lib/email");

        const emailHtml = await render(
          <OrderStatusEmail 
            orderNumber={updatedOrder.orderNumber}
            customerName={updatedOrder.user.firstName || "Customer"}
            status={status}
            trackingUrl={trackingUrl}
          />
        );

        await sendEmail({
          to: updatedOrder.user.email,
          subject: `Order Update: #${updatedOrder.orderNumber}`,
          html: emailHtml,
          type: "ORDER"
        });
      } else if (status === "REFUNDED") {
        const { render } = await import("@react-email/render");
        const { RefundStatusEmail } = await import("@/emails/RefundStatusEmail");
        const { sendEmail } = await import("@/lib/email");

        const emailHtml = await render(
          <RefundStatusEmail 
            orderNumber={updatedOrder.orderNumber}
            customerName={updatedOrder.user.firstName || "Customer"}
            amount={`₹${updatedOrder.total.toFixed(2)}`}
          />
        );

        await sendEmail({
          to: updatedOrder.user.email,
          subject: `Refund Processed for Order #${updatedOrder.orderNumber}`,
          html: emailHtml,
          type: "ORDER"
        });
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

// -----------------------------------------------------------------------------
// CART & WISHLIST ACTIONS (PERSISTENCE)
// -----------------------------------------------------------------------------

export async function syncCartToDatabase(cartItems: Array<{ variantId: string; quantity: number }>) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { success: false, error: "Not logged in" };

  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    
    await prisma.cartItem.createMany({
      data: cartItems.map(item => ({
        cartId: cart!.id,
        variantId: item.variantId,
        quantity: item.quantity
      }))
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to sync cart:", error);
    return { success: false, error: "Database connection pending." };
  }
}

// -----------------------------------------------------------------------------
// CLOUDINARY ACTIONS
// -----------------------------------------------------------------------------

export async function uploadProductImageAction(formData: FormData) {
  console.log("[UPLOAD ACTION] Reached uploadProductImageAction");
  
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  
  console.log("[UPLOAD ACTION] User ID:", userId);
  
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "orinko/products";
    
    console.log("[UPLOAD ACTION] Received file:", !!file);
    if (!file) return { success: false, error: "No file provided" };
    
    console.log("[UPLOAD ACTION] File Details: name=", file.name, "type=", file.type, "size=", file.size);
    
    if (!file.type.startsWith("image/")) return { success: false, error: "Invalid file type" };
    if (file.size > 5 * 1024 * 1024) return { success: false, error: "File too large (max 5MB)" };

    console.log("[UPLOAD ACTION] Converting file to buffer...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("[UPLOAD ACTION] Buffer created, size:", buffer.length);

    console.log("[UPLOAD ACTION] Calling uploadToCloudinary...");
    const result = await uploadToCloudinary(buffer, folder);
    console.log("[UPLOAD ACTION] Cloudinary Upload Result:", result);

    return { 
      success: true, 
      secure_url: result.secure_url,
      public_id: result.public_id 
    };
  } catch (error: any) {
    console.error("[UPLOAD ACTION] CATCH BLOCK - Cloudinary Upload Action Error:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
}

export async function uploadBannerImageAction(formData: FormData) {
  formData.set("folder", "orinko/banners");
  return uploadProductImageAction(formData);
}

export async function deleteProductImageAction(publicId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const deleted = await deleteFromCloudinary(publicId);
    if (!deleted) return { success: false, error: "Cloudinary deletion failed" };
    
    return { success: true };
  } catch (error) {
    console.error("Cloudinary Delete Action Error:", error);
    return { success: false, error: "Delete failed" };
  }
}

// -----------------------------------------------------------------------------
// ADDRESS ACTIONS
// -----------------------------------------------------------------------------

export async function getAddresses() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized", data: [] };

  try {
    const user = await prisma.user.findUnique({
      where: { authId: authData.user.id },
      include: { addresses: { orderBy: { createdAt: "desc" } } }
    });
    return { success: true, data: user?.addresses || [] };
  } catch (error) {
    return { success: false, error: "Failed to fetch addresses", data: [] };
  }
}

export async function addAddress(data: {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  label?: string;
  isDefault?: boolean;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    // If new address is default, reset others
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    // Check if this is the first address, make it default automatically
    const count = await prisma.address.count({ where: { userId: user.id } });
    const shouldBeDefault = count === 0 || data.isDefault;

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || "India",
        phone: data.phone,
        label: data.label,
        isDefault: shouldBeDefault
      }
    });

    revalidatePath("/account");
    return { success: true, data: address };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add address" };
  }
}

export async function editAddress(id: string, data: {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  label?: string;
  isDefault?: boolean;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== user.id) return { success: false, error: "Address not found" };

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || "India",
        phone: data.phone,
        label: data.label,
        isDefault: data.isDefault !== undefined ? data.isDefault : address.isDefault
      }
    });

    revalidatePath("/account");
    return { success: true, data: updatedAddress };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to edit address" };
  }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    await prisma.address.delete({
      where: { id, userId: user.id }
    });

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete address" };
  }
}

export async function setDefaultAddress(id: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    // Reset all
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false }
    });

    // Set new default
    await prisma.address.update({
      where: { id, userId: user.id },
      data: { isDefault: true }
    });

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to set default address" };
  }
}

// -----------------------------------------------------------------------------
// CHECKOUT & ORDERS
// -----------------------------------------------------------------------------

export async function createRazorpayOrderAction(amount: number) {
  try {
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "rcptid_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
    return { success: true, orderId: order.id, amount: order.amount };
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return { success: false, error: error.message || "Failed to create Razorpay order" };
  }
}

export async function verifyPaymentAndCreateOrderAction(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  shippingAddressId: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  items: Array<{
    variantId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    customImage?: string | null;
  }>;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Must be logged in to place an order" };

  // Verify Signature
  const secret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
  const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");

  if (expectedSignature !== data.razorpay_signature) {
    return { success: false, error: "Invalid payment signature" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000).toString();

    // Deduct inventory
    for (const item of data.items) {
      if (item.variantId) {
        const inv = await prisma.inventory.update({
          where: { variantId: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
        if (inv.stock <= inv.lowStockThreshold) {
          await createAdminNotification({
            type: "STOCK",
            entityId: inv.id,
            title: `Low Stock: ${item.productName}`,
            message: `Stock has dropped to ${inv.stock}`,
            link: "/admin/products"
          });
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        subtotal: data.subtotal,
        tax: data.tax,
        shippingFee: data.shippingFee,
        total: data.total,
        shippingAddressId: data.shippingAddressId,
        items: {
          create: data.items.map(item => ({
            variantId: item.variantId || null,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            customImage: item.customImage || null
          }))
        },
        payment: {
          create: {
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
            method: data.paymentMethod,
            amount: data.total,
            status: "SUCCESS"
          }
        }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account");
    revalidatePath("/orders");

    await createAdminNotification({
      type: "ORDER",
      entityId: order.id,
      title: `New Order: ${orderNumber}`,
      message: `A new order has been placed for ₹${data.total}.`,
      link: "/admin/orders?status=PENDING"
    });

    if (user.email) {
      try {
        const { render } = await import("@react-email/render");
        const { OrderConfirmationEmail } = await import("@/emails/OrderConfirmationEmail");
        const { sendEmail } = await import("@/lib/email");

        const emailHtml = await render(
          <OrderConfirmationEmail 
            orderNumber={orderNumber}
            customerName={user.firstName || "Customer"}
            total={data.total}
          />
        );

        await sendEmail({
          to: user.email,
          subject: `Order Confirmed & Payment Received: #${orderNumber}`,
          html: emailHtml,
          type: "ORDER"
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }

    return { success: true, orderNumber };
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

export async function createCodOrderAction(data: {
  shippingAddressId: string;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  items: Array<{
    variantId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    customImage?: string | null;
  }>;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Must be logged in to place an order" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000).toString();

    // Deduct inventory
    for (const item of data.items) {
      if (item.variantId) {
        const inv = await prisma.inventory.update({
          where: { variantId: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
        if (inv.stock <= inv.lowStockThreshold) {
          await createAdminNotification({
            type: "STOCK",
            entityId: inv.id,
            title: `Low Stock: ${item.productName}`,
            message: `Stock has dropped to ${inv.stock}`,
            link: "/admin/products"
          });
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        subtotal: data.subtotal,
        tax: data.tax,
        shippingFee: data.shippingFee,
        total: data.total,
        shippingAddressId: data.shippingAddressId,
        items: {
          create: data.items.map(item => ({
            variantId: item.variantId || null,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            customImage: item.customImage || null
          }))
        },
        payment: {
          create: {
            razorpayOrderId: "COD_" + Date.now(),
            method: data.paymentMethod,
            amount: data.total,
            status: "PENDING"
          }
        }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/account");
    revalidatePath("/orders");

    await createAdminNotification({
      type: "ORDER",
      entityId: order.id,
      title: `New Order: ${orderNumber}`,
      message: `A new order has been placed for ₹${data.total}.`,
      link: "/admin/orders?status=PENDING"
    });

    if (user.email) {
      try {
        const { render } = await import("@react-email/render");
        const { OrderConfirmationEmail } = await import("@/emails/OrderConfirmationEmail");
        const { sendEmail } = await import("@/lib/email");

        const emailHtml = await render(
          <OrderConfirmationEmail 
            orderNumber={orderNumber}
            customerName={user.firstName || "Customer"}
            total={data.total}
          />
        );

        await sendEmail({
          to: user.email,
          subject: `Order Confirmed: #${orderNumber}`,
          html: emailHtml,
          type: "ORDER"
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }

    return { success: true, orderNumber };
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

// -----------------------------------------------------------------------------
// REVIEWS ACTIONS
// -----------------------------------------------------------------------------

export async function addReviewAction(productId: string, data: { rating: number, title?: string, comment?: string }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Must be logged in to leave a review." };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found." };

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        items: { some: { variant: { productId } } },
        status: { in: ["DELIVERED"] }
      }
    });

    const isVerifiedBuyer = !!order;

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerifiedBuyer
      }
    });

    await createAdminNotification({
      type: "REVIEW",
      entityId: newReview.id,
      title: `New Review for Product`,
      message: `${user.firstName} left a ${data.rating}-star review.`,
      link: "/admin/products"
    });

    revalidatePath(`/product/[slug]`, 'page');
    return { success: true };
  } catch (error: any) {
    console.error("Add review error:", error);
    return { success: false, error: error.message || "Failed to add review." };
  }
}

// -----------------------------------------------------------------------------
// COUPON ACTIONS
// -----------------------------------------------------------------------------

export async function validateCouponAction(code: string, subtotal: number) {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) return { success: false, error: "Invalid or inactive coupon." };

    const now = new Date();
    if (now < coupon.startDate) return { success: false, error: "Coupon is not active yet." };
    if (now > coupon.endDate) return { success: false, error: "Coupon has expired." };

    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      return { success: false, error: `Minimum order value of ₹${coupon.minOrderValue} required.` };
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached." };
    }

    // In a real app we'd check perUserLimit by looking at the user's past orders

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Don't discount more than subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return { 
      success: true, 
      couponId: coupon.id,
      code: coupon.code,
      discountAmount: discountAmount 
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { success: false, error: "Failed to validate coupon." };
  }
}

export async function getUserProfileAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { authId: authData.user.id }
    });
    return { success: true, data: user };
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return { success: false, error: error.message || "Failed to load profile." };
  }
}

export async function updateUserProfileAction(data: { firstName: string; lastName: string }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const updatedUser = await prisma.user.update({
      where: { authId: authData.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName
      }
    });

    await supabase.auth.updateUser({
      data: {
        first_name: data.firstName,
        last_name: data.lastName
      }
    });

    return { success: true, data: updatedUser };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

export async function getCodSettingAction() {
  try {
    const codSetting = await prisma.setting.findUnique({
      where: { key: "COD" }
    });
    return { success: true, enabled: codSetting?.value === "ON" };
  } catch (error) {
    console.error("Get COD setting error:", error);
    return { success: true, enabled: false };
  }
}

export async function getUserOrders() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized", data: [] };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found", data: [] };

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { order: 'asc' }, take: 1 }
                  }
                }
              }
            }
          }
        },
        payment: true
      }
    });

    return {
      success: true,
      data: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        date: new Date(o.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
        status: o.status,
        total: Number(o.total),
        paymentMethod: o.payment?.method || "UPI",
        paymentStatus: o.payment?.status || "PENDING",
        itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
        thumbnails: o.items.slice(0, 3).map(item => item.customImage || item.variant?.product?.images[0]?.url || "/images/placeholder.png")
      }))
    };
  } catch (error: any) {
    console.error("Get user orders error:", error);
    return { success: false, error: error.message || "Failed to load orders", data: [] };
  }
}

export async function getOrderDetails(orderIdOrNumber: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized", data: null };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found", data: null };

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);

    console.log("[DEBUG getOrderDetails]", {
      orderIdOrNumber,
      isUUID,
      userId: user.id,
      authId: authData.user.id
    });

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        ...(isUUID ? { id: orderIdOrNumber } : { orderNumber: orderIdOrNumber })
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                size: true,
                color: true,
                product: {
                  include: { categories: true }
                }
              }
            },
            returns: true
          }
        },
        payment: true
      }
    });

    if (!order) return { success: false, error: "Order not found or access denied", data: null };

    // Fetch shipping address separately to prevent INNER JOIN failures if data is inconsistent
    let shippingAddress = null;
    if (order.shippingAddressId) {
      shippingAddress = await prisma.address.findUnique({
        where: { id: order.shippingAddressId }
      });
    }

    const returnWindowSetting = await prisma.setting.findUnique({ where: { key: "RETURN_WINDOW_DAYS" } });
    const returnWindowDays = parseInt(returnWindowSetting?.value || "7", 10);
    
    let isWithinReturnWindow = false;
    let returnWindowExpired = false;

    if (order.status === "DELIVERED") {
      const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
      const now = new Date();
      const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysSinceDelivery <= returnWindowDays) {
        isWithinReturnWindow = true;
      } else {
        returnWindowExpired = true;
      }
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }),
        status: order.status,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        tax: Number(order.tax),
        total: Number(order.total),
        shippingAddress: shippingAddress,
        payment: order.payment,
        isWithinReturnWindow,
        returnWindowExpired,
        items: order.items.map(item => {
          const isCustomPrint = item.customImage !== null || item.variant?.product?.categories?.some(c => c.slug === 'custom-printing');
          const hasActiveReturn = item.returns && item.returns.length > 0;
          
          return {
            id: item.id,
            productName: item.productName,
            productPrice: Number(item.productPrice),
            quantity: item.quantity,
            customImage: item.customImage || null,
            size: item.variant?.size?.name || "M",
            color: item.variant?.color?.name || "Black",
            isCustomPrint,
            hasActiveReturn,
            returns: item.returns
          };
        })
      }
    };
  } catch (error: any) {
    console.error("Get order details error:", error);
    return { success: false, error: error.message || "Failed to load order details", data: null };
  }
}

// -----------------------------------------------------------------------------
// RETURNS ACTIONS
// -----------------------------------------------------------------------------

export async function submitReturnRequestAction(data: {
  orderId: string;
  orderItemId: string;
  type: "REFUND" | "REPLACEMENT";
  reason: string;
  description: string;
  images: string[];
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
      include: { order: true }
    });

    if (!orderItem || orderItem.order.userId !== user.id) {
      return { success: false, error: "Invalid order item" };
    }

    if (orderItem.order.status !== "DELIVERED") {
      return { success: false, error: "Order is not delivered yet" };
    }


    const returnWindowSetting = await prisma.setting.findUnique({ where: { key: "RETURN_WINDOW_DAYS" } });
    const returnWindowDays = parseInt(returnWindowSetting?.value || "7", 10);
    
    const deliveredDate = orderItem.order.deliveredAt ? new Date(orderItem.order.deliveredAt) : new Date(orderItem.order.createdAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 3600 * 24));
    
    if (daysSinceDelivery > returnWindowDays) {
      return { success: false, error: "Return window has expired" };
    }

    // Check if active return already exists
    const existing = await prisma.return.findFirst({
      where: {
        orderItemId: data.orderItemId,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existing) {
      return { success: false, error: "An active return request already exists for this item" };
    }

    const newReturn = await prisma.return.create({
      data: {
        orderId: data.orderId,
        userId: user.id,
        orderItemId: data.orderItemId,
        type: data.type,
        reason: data.reason,
        description: data.description,
        images: data.images,
        status: "PENDING"
      }
    });

    if (user.email) {
      const { render } = await import("@react-email/render");
      const { ReturnStatusEmail } = await import("@/emails/ReturnStatusEmail");
      const { sendEmail } = await import("@/lib/email");

      const emailHtml = await render(
        <ReturnStatusEmail 
          customerName={user.firstName || "Customer"}
          orderNumber={orderItem.order.orderNumber}
          productName={orderItem.productName}
          status="PENDING"
          type={data.type}
        />
      );

      await sendEmail({
        to: user.email,
        subject: `Your ${data.type === 'REFUND' ? 'Return' : 'Replacement'} Request Has Been Received`,
        html: emailHtml,
        type: "ORDER"
      });
    }

    revalidatePath(`/orders/${data.orderId}`);

    await createAdminNotification({
      type: "RETURN",
      entityId: newReturn.id,
      title: `New ${data.type === 'REFUND' ? 'Return' : 'Replacement'} Request`,
      message: `Request for order ${orderItem.order.orderNumber} needs review.`,
      link: "/admin/returns"
    });

    return { success: true, returnId: newReturn.id };
  } catch (error: any) {
    console.error("Submit return error:", error);
    return { success: false, error: error.message || "Failed to submit return request" };
  }
}

// -----------------------------------------------------------------------------
// SEARCH & NOTIFICATIONS
// -----------------------------------------------------------------------------

export async function searchStorefrontAction(query: string) {
  if (!query || query.trim().length < 2) return { success: true, data: [] };
  
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 5,
      include: {
        images: {
          orderBy: { order: "asc" },
          take: 1
        }
      }
    });

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      image: p.images[0]?.url || "/images/placeholder.png"
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Storefront Search Error:", error);
    return { success: false, data: [] };
  }
}

export async function getAdminNotificationsAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "STAFF")) {
      return { success: false, error: "Unauthorized" };
    }

    const notifications = await prisma.adminNotification.findMany({
      where: {
        isResolved: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    return { 
      success: true, 
      count: notifications.length,
      notifications: notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        description: n.message,
        link: n.link,
        type: n.type,
        entityId: n.entityId
      }))
    };
  } catch (error) {
    console.error("Admin Notifications Error:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

// -----------------------------------------------------------------------------
// CANCEL ORDER ACTION
// -----------------------------------------------------------------------------

export async function cancelOrderAction(orderId: string, reason?: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { authId: authData.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id }
    });

    if (!order) return { success: false, error: "Order not found" };

    if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) {
      return { success: false, error: "Order cannot be cancelled at this stage." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancellationReason: reason }
    });

    await createAdminNotification({
      type: "ORDER",
      entityId: order.id,
      title: "Order Cancelled",
      message: `Order #${order.orderNumber} was cancelled by the customer.`,
      link: `/admin/orders/${order.id}`
    });

    try {
      const { resolveAdminNotification } = await import("@/lib/notification-actions");
      await resolveAdminNotification("ORDER", order.id);
    } catch(e) {
      // Ignore
    }

    try {
      const { sendEmail } = await import("@/lib/email");
      const { OrderStatusEmail } = await import("@/emails/OrderStatusEmail");
      
      const { render } = await import("@react-email/render");
      const emailHtml = await render(
        <OrderStatusEmail 
          orderNumber={order.orderNumber} 
          customerName={user.firstName || "Customer"} 
          status="CANCELLED"
        />
      );

      await sendEmail({
        to: user.email,
        subject: `Order Cancelled - #${order.orderNumber}`,
        html: emailHtml,
        type: "ORDER"
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return { success: false, error: error.message || "Failed to cancel order" };
  }
}


export async function getMaintenanceMode() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "MAINTENANCE_MODE" }
    });
    return setting?.value === "ON";
  } catch (error) {
    return false;
  }
}
