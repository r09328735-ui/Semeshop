import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  trackingUrl: string;
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shippingCost,
  taxAmount,
  discountAmount,
  total,
  trackingUrl,
}: OrderConfirmationEmailProps): JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Votre commande {orderNumber} est confirmée</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Merci pour votre commande, {customerName} !</Heading>
          <Text style={text}>
            Votre commande <strong>{orderNumber}</strong> a bien été confirmée et est en cours de
            préparation.
          </Text>
          <Section style={{ margin: "24px 0" }}>
            {items.map((item, index) => (
              <Row key={index} style={{ padding: "6px 0" }}>
                <Column>
                  <Text style={itemText}>
                    {item.quantity} × {item.name}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={itemText}>{formatEur(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}
          </Section>
          <Hr style={hr} />
          <Row>
            <Column>
              <Text style={text}>Sous-total</Text>
            </Column>
            <Column align="right">
              <Text style={text}>{formatEur(subtotal)}</Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text style={text}>Livraison</Text>
            </Column>
            <Column align="right">
              <Text style={text}>{formatEur(shippingCost)}</Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text style={text}>Taxes</Text>
            </Column>
            <Column align="right">
              <Text style={text}>{formatEur(taxAmount)}</Text>
            </Column>
          </Row>
          {discountAmount > 0 && (
            <Row>
              <Column>
                <Text style={text}>Remise</Text>
              </Column>
              <Column align="right">
                <Text style={text}>-{formatEur(discountAmount)}</Text>
              </Column>
            </Row>
          )}
          <Hr style={hr} />
          <Row>
            <Column>
              <Text style={totalText}>Total</Text>
            </Column>
            <Column align="right">
              <Text style={totalText}>{formatEur(total)}</Text>
            </Column>
          </Row>
          <Text style={{ ...text, marginTop: "24px" }}>
            Vous pouvez suivre l&apos;état de votre commande depuis votre espace client :{" "}
            <a href={trackingUrl}>{trackingUrl}</a>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>SemevoShop — boutique en ligne</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmationEmail;

const main = { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "480px" };
const heading = { fontSize: "20px", fontWeight: 700, color: "#18181b" };
const text = { fontSize: "14px", lineHeight: "22px", color: "#3f3f46" };
const itemText = { fontSize: "13px", lineHeight: "20px", color: "#3f3f46" };
const totalText = { fontSize: "16px", fontWeight: 700, color: "#18181b" };
const hr = { borderColor: "#e4e4e7", margin: "16px 0" };
const footer = { fontSize: "12px", color: "#a1a1aa" };
