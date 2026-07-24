"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { resolveAdminNotification } from "@/lib/notification-actions";
import { getUserRole } from "@/lib/rbac";
import { ReturnStatus } from "@prisma/client";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return false;
  const role = await getUserRole(authData.user, supabase);
  return role === "admin" || role === "super_admin";
}

export async function getAdminReturns() {
  if (!(await verifyAdmin())) return { success: false, error: "Unauthorized", data: [] };

  try {
    const returns = await prisma.return.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        orderItem: true,
        user: true,
      }
    });

    return { success: true, data: returns };
  } catch (error: any) {
    console.error("Get admin returns error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function approveReturnAction(returnId: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const returnReq = await prisma.return.findUnique({
      where: { id: returnId },
      include: { orderItem: true, order: true }
    });

    if (!returnReq) return { success: false, error: "Return not found" };
    if (returnReq.status !== "PENDING") return { success: false, error: "Return is not pending" };

    let replacementOrderId = null;

    // If replacement, create a new zero-cost order
    if (returnReq.type === "REPLACEMENT") {
      const orderNumber = "REP-" + Math.floor(100000 + Math.random() * 900000).toString();
      
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          userId: returnReq.userId,
          status: "PENDING",
          subtotal: 0,
          tax: 0,
          shippingFee: 0,
          total: 0,
          shippingAddressId: returnReq.order.shippingAddressId,
          items: {
            create: {
              variantId: returnReq.orderItem.variantId,
              productName: returnReq.orderItem.productName + " (Replacement)",
              productPrice: 0,
              quantity: returnReq.orderItem.quantity,
              customImage: returnReq.orderItem.customImage
            }
          },
          payment: {
            create: {
              razorpayOrderId: "REP_" + Date.now(),
              method: "REPLACEMENT",
              amount: 0,
              status: "SUCCESS"
            }
          }
        }
      });
      replacementOrderId = newOrder.id;
    }

    const updated = await prisma.return.update({
      where: { id: returnId },
      data: { 
        status: "APPROVED",
        replacementOrderId
      },
      include: { user: true, orderItem: true, order: true }
    });

    if (updated.user.email) {
      const { render } = await import("@react-email/render");
      const { ReturnStatusEmail } = await import("@/emails/ReturnStatusEmail");
      const { sendEmail } = await import("@/lib/email");

      const emailHtml = await render(
        <ReturnStatusEmail 
          customerName={updated.user.firstName || "Customer"}
          orderNumber={updated.order.orderNumber}
          productName={updated.orderItem.productName}
          status="APPROVED"
          type={updated.type}
        />
      );

      await sendEmail({
        to: updated.user.email,
        subject: `Your ${updated.type === 'REFUND' ? 'Return' : 'Replacement'} Request Has Been Approved!`,
        html: emailHtml,
        type: "ORDER"
      });
    }

    await resolveAdminNotification("RETURN", returnId);

    revalidatePath("/admin/returns");
    return { success: true };
  } catch (error: any) {
    console.error("Approve return error:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectReturnAction(returnId: string) {
  if (!(await verifyAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const updated = await prisma.return.update({
      where: { id: returnId },
      data: { status: "REJECTED" },
      include: { user: true, orderItem: true, order: true }
    });

    if (updated.user.email) {
      const { render } = await import("@react-email/render");
      const { ReturnStatusEmail } = await import("@/emails/ReturnStatusEmail");
      const { sendEmail } = await import("@/lib/email");

      const emailHtml = await render(
        <ReturnStatusEmail 
          customerName={updated.user.firstName || "Customer"}
          orderNumber={updated.order.orderNumber}
          productName={updated.orderItem.productName}
          status="REJECTED"
          type={updated.type}
        />
      );

      await sendEmail({
        to: updated.user.email,
        subject: `Update Regarding Your ${updated.type === 'REFUND' ? 'Return' : 'Replacement'} Request`,
        html: emailHtml,
        type: "ORDER"
      });
    }

    await resolveAdminNotification("RETURN", returnId);

    revalidatePath("/admin/returns");
    return { success: true };
  } catch (error: any) {
    console.error("Reject return error:", error);
    return { success: false, error: error.message };
  }
}
