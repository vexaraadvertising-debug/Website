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

interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  status: "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "PROCESSING" | "CANCELLED";
  trackingUrl?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  storeContact?: string;
  products?: { name: string; quantity: number; price: number }[];
}

export const OrderStatusEmail = ({
  orderNumber,
  customerName,
  status,
  trackingUrl,
  trackingNumber,
  estimatedDelivery,
  storeContact = "support@orinko.in",
  products = [],
}: OrderStatusEmailProps) => {
  
  const getStatusMessage = () => {
    switch (status) {
      case "PROCESSING": return "Your order is now being printed and processed.";
      case "CONFIRMED": return "Your order has been confirmed and is being prepared.";
      case "PACKED": return "Your order has been packed and is ready to be shipped.";
      case "SHIPPED": return "Good news! Your order has been shipped.";
      case "DELIVERED": return "Your order has been delivered! We hope you love it.";
      case "CANCELLED": return "Your order has been cancelled.";
      default: return "There is an update on your order.";
    }
  };

  const getStatusHeading = () => {
    switch (status) {
      case "PROCESSING": return "Order Processing";
      case "CONFIRMED": return "Order Confirmed";
      case "PACKED": return "Order Packed";
      case "SHIPPED": return "Order Shipped";
      case "DELIVERED": return "Order Delivered";
      case "CANCELLED": return "Order Cancelled";
      default: return "Order Update";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{getStatusHeading()} - #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{getStatusHeading()}</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            {getStatusMessage()}
          </Text>
          
          <Section style={orderSection}>
            <Text style={orderLabel}>Order Number</Text>
            <Text style={orderValue}>#{orderNumber}</Text>
            
            {trackingNumber && (
              <>
                <Text style={orderLabel}>Tracking Number</Text>
                <Text style={orderValue}>{trackingNumber}</Text>
              </>
            )}
            
            {estimatedDelivery && (
              <>
                <Text style={orderLabel}>Estimated Delivery</Text>
                <Text style={orderValue}>{estimatedDelivery}</Text>
              </>
            )}
          </Section>

          {products && products.length > 0 && (
            <Section style={{ padding: "20px 0" }}>
              <Text style={{ ...h1, fontSize: "18px", textAlign: "left", textTransform: "none" }}>Order Summary</Text>
              <Hr style={{ borderColor: "#e6ebf1", margin: "10px 0" }} />
              {products.map((product, index) => (
                <Row key={index} style={{ marginBottom: "10px" }}>
                  <Column style={{ width: "80%" }}>
                    <Text style={{ margin: 0, color: "#333", fontSize: "14px", fontWeight: "bold" }}>
                      {product.name}
                    </Text>
                    <Text style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                      Qty: {product.quantity}
                    </Text>
                  </Column>
                  <Column style={{ width: "20%", textAlign: "right" }}>
                    <Text style={{ margin: 0, color: "#333", fontSize: "14px", fontWeight: "bold" }}>
                      ₹{product.price}
                    </Text>
                  </Column>
                </Row>
              ))}
              <Hr style={{ borderColor: "#e6ebf1", margin: "10px 0" }} />
            </Section>
          )}

          {status === "SHIPPED" && trackingUrl && (
            <Section style={buttonContainer}>
              <Button style={button} href={trackingUrl}>
                Track Package
              </Button>
            </Section>
          )}
          
          <Text style={footer}>
            Need help? Contact us at {storeContact}<br/><br/>
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
  textAlign: "center" as const,
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

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#FFC107",
  borderRadius: "8px",
  color: "#111",
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

export default OrderStatusEmail;
