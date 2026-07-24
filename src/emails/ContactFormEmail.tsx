import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

interface ContactFormEmailProps {
  name: string;
  email: string;
  message: string;
}

export const ContactFormEmail = ({
  name,
  email,
  message,
}: ContactFormEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Contact Form Submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Submission</Heading>
          
          <Section style={infoSection}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>
            
            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>
            
            <Text style={label}>Message</Text>
            <Text style={value}>{message}</Text>
          </Section>
          
          <Text style={footer}>
            Sent via ORINKO Contact Form
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

const infoSection = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
  borderRadius: "8px",
};

const label = {
  margin: "0",
  fontSize: "12px",
  color: "#8898aa",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
  letterSpacing: "1px",
};

const value = {
  margin: "4px 0 16px",
  fontSize: "16px",
  color: "#111111",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "40px",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  fontWeight: "bold",
};

export default ContactFormEmail;
