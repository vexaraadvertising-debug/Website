export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import { ContactFormEmail } from "@/emails/ContactFormEmail";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const emailHtml = await render(
      <ContactFormEmail name={name} email={email} message={message} />
    );

    const adminEmail = process.env.CONTACT_EMAIL || "vexaraadvertising@gmail.com";

    const result = await sendEmail({
      to: adminEmail, 
      subject: `New Contact Form Submission from ${name}`,
      html: emailHtml,
      type: "SUPPORT"
    });

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
