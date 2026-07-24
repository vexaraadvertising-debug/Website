import * as React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button } from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your ORINKO password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Reset</Heading>
          
          <Text style={text}>Hello,</Text>
          
          <Text style={text}>
            We received a request to reset your password for your ORINKO account. You can reset your password by clicking the button below:
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Text style={text}>
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </Text>

          <Text style={footer}>
            Orinko Support Team<br/>
            Contact: support@orinko.in
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
  color: "#d946ef",
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
  backgroundColor: "#0f172a",
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
