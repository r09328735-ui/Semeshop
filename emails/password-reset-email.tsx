import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps): JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe Semeshop</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Réinitialisation de mot de passe</Heading>
          <Text style={text}>
            Vous avez demandé la réinitialisation de votre mot de passe Semeshop. Cliquez sur le
            bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button style={button} href={resetUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>
          <Text style={text}>
            Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous pouvez ignorer cet
            email en toute sécurité.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Semeshop — boutique en ligne</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PasswordResetEmail;

const main = { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "32px 24px", maxWidth: "480px" };
const heading = { fontSize: "20px", fontWeight: 700, color: "#18181b" };
const text = { fontSize: "14px", lineHeight: "22px", color: "#3f3f46" };
const button = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 24px",
};
const hr = { borderColor: "#e4e4e7", margin: "24px 0" };
const footer = { fontSize: "12px", color: "#a1a1aa" };
