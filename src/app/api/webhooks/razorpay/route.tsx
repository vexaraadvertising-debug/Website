export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(text);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { order: { include: { items: true } } }
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            razorpayPaymentId: paymentData.id,
            razorpaySignature: signature,
          }
        });

        // Update order status to CONFIRMED
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" }
        });

        // Decrease Inventory safely
        for (const item of payment.order.items) {
          if (item.variantId) {
            await prisma.inventory.update({
              where: { variantId: item.variantId },
              data: {
                stock: { decrement: item.quantity }
              }
            });
          }
        }
        
        // Send Order Confirmation Email
        // Assuming we have the user email from somewhere. 
        // We'll fetch it from the order if possible.
        const orderWithUser = await prisma.order.findUnique({
          where: { id: payment.orderId },
          include: { user: true }
        });
        
        if (orderWithUser && orderWithUser.user?.email) {
          const emailHtml = await render(
            <OrderConfirmationEmail 
              orderNumber={orderWithUser.orderNumber} 
              customerName={orderWithUser.user.firstName || "Customer"} 
              total={Number(orderWithUser.total)} 
            />
          );
          
          await sendEmail({
            to: orderWithUser.user.email,
            subject: `Order Confirmed & Payment Received: #${orderWithUser.orderNumber}`,
            html: emailHtml,
            type: "ORDER"
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
