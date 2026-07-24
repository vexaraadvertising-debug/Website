import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface ReturnStatusEmailProps {
  customerName: string;
  orderNumber: string;
  productName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  type: "REFUND" | "REPLACEMENT";
  reason?: string; // Optional rejection reason
}

export function ReturnStatusEmail({
  customerName,
  orderNumber,
  productName,
  status,
  type,
  reason,
}: ReturnStatusEmailProps) {
  let title = "Return Request Update";
  let message = "";

  if (status === "PENDING") {
    title = `We've Received Your ${type === 'REFUND' ? 'Return' : 'Replacement'} Request`;
    message = `Thank you for your request. Our team is currently reviewing it and we will get back to you within 24-48 hours.`;
  } else if (status === "APPROVED") {
    title = `Your ${type === 'REFUND' ? 'Return' : 'Replacement'} Has Been Approved!`;
    message = `Good news! Your request for ${productName} has been approved. A pickup will be arranged at your delivery address soon.`;
  } else if (status === "REJECTED") {
    title = `Update Regarding Your ${type === 'REFUND' ? 'Return' : 'Replacement'} Request`;
    message = `Unfortunately, we are unable to approve your request at this time.`;
  }

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Heading style={h1}>{title}</Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>{message}</Text>
            
            <Section style={orderBox}>
              <Text style={orderDetails}><strong>Order:</strong> #{orderNumber}</Text>
              <Text style={orderDetails}><strong>Item:</strong> {productName}</Text>
            </Section>

            {status === "REJECTED" && reason && (
              <Text style={text}>
                <strong>Reason for rejection:</strong> {reason}
              </Text>
            )}

            <Text style={footer}>
              If you have any questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Helvetica, Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const orderBox = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "20px",
  marginBottom: "20px",
};

const orderDetails = {
  color: "#333",
  fontSize: "14px",
  margin: "0",
  padding: "0",
  lineHeight: "24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "40px",
};
