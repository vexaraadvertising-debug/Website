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
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  total: number;
}

export const OrderConfirmationEmail = ({
  orderNumber = "ORD-0001",
  customerName = "Valued Customer",
  total = 0,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Order Confirmed! #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Thank you for shopping at ORINKO! We've received your order and are currently processing it.
          </Text>
          
          <Section style={orderSection}>
            <Text style={orderLabel}>Order Number</Text>
            <Text style={orderValue}>#{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Row>
              <Column>
                <Text style={totalLabel}>Total Amount</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>₹{total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href="https://orinko.in/orders">
              View Order Status
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

const text = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "26px",
  marginBottom: "16px",
};

const orderSection = {
  backgroundColor: "#f9f9f9",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const orderLabel = {
  margin: "0",
  fontSize: "12px",
  color: "#8898aa",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
  letterSpacing: "1px",
};

const orderValue = {
  margin: "4px 0 0",
  fontSize: "20px",
  fontWeight: "bold",
  color: "#111111",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const totalLabel = {
  fontSize: "16px",
  color: "#666666",
  fontWeight: "bold",
};

const totalValue = {
  fontSize: "18px",
  color: "#111111",
  fontWeight: "800",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#FF2D96",
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

export default OrderConfirmationEmail;
