import * as React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button } from "@react-email/components";

interface RefundStatusEmailProps {
  customerName: string;
  orderNumber: string;
  amount?: string;
}

export function RefundStatusEmail({
  customerName = "Valued Customer",
  orderNumber = "ORD-0000",
  amount,
}: RefundStatusEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your refund for order #{orderNumber} has been processed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Refund Processed</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            We're writing to let you know that a refund has been successfully processed for your order <strong>#{orderNumber}</strong>.
            {amount && ` The total amount refunded is ${amount}.`}
          </Text>

          <Text style={text}>
            Please note that it may take 5-7 business days for the funds to appear on your original payment method, depending on your bank's processing times.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/orders`}>
              View Your Orders
            </Button>
          </Section>

          <Text style={footer}>
            If you have any questions or haven't received your refund within 7 business days, please reply to this email or contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "600px",
};

const h1 = {
  color: "#d946ef", // ORINKO Magenta
  fontSize: "24px",
  fontWeight: "800",
  margin: "0 0 20px",
  padding: "0",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const text = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0f172a", // slate-900
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const footer = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "32px 0 0",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "24px",
};
