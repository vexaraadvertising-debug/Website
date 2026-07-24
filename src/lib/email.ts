import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType = "ORDER" | "SUPPORT" | "AUTH" | "GENERAL";

export async function sendEmail({
  to,
  subject,
  html,
  type = "GENERAL",
}: {
  to: string;
  subject: string;
  html: string;
  type?: EmailType;
}) {
  try {
    console.log(`[EMAIL] Attempting to send email to: ${to} | Subject: "${subject}" | Type: ${type}`);
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("[EMAIL] RESEND_API_KEY is not set. Email will not be sent.");
      return { success: false, error: "Email configuration missing." };
    }

    let senderEmail = process.env.EMAIL_NOREPLY || "ORINKO <noreply@orinko.in>";
    if (type === "ORDER") {
      senderEmail = process.env.EMAIL_ORDERS || "ORINKO <orders@orinko.in>";
    } else if (type === "SUPPORT") {
      senderEmail = process.env.EMAIL_SUPPORT || "ORINKO <support@orinko.in>";
    } else if (type === "AUTH") {
      senderEmail = process.env.EMAIL_NOREPLY || "ORINKO <noreply@orinko.in>";
    }

    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to,
      subject,
      html,
      replyTo: type === "AUTH" ? undefined : process.env.SUPPORT_EMAIL || "support@orinko.in",
    });

    if (error) {
      console.error("[EMAIL] Resend API Error:", error.name, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Successfully sent. ID: ${data?.id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("[EMAIL] Failed to send email via Resend:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
