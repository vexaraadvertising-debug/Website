import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
  Img,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ORINKO! Print Your Style.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to ORINKO</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            We're thrilled to have you here. ORINKO is India's most premium Print-on-Demand fashion brand.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href="https://orinko.in">
              Explore Collections
            </Button>
          </Section>
          <Text style={footer}>
            Print Your Style. © {new Date().getFullYear()} ORINKO.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
};

const h1 = {
  color: "#111111",
  fontSize: "24px",
  fontWeight: "800",
  textAlign: "center" as const,
  margin: "0 0 20px",
  textTransform: "uppercase" as const,
};

const text = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "26px",
  marginBottom: "16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#111111",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "40px",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  fontWeight: "bold",
};

export default WelcomeEmail;
