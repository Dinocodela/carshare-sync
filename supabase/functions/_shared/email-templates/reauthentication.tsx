/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your TESLYS verification code</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={headerBand}>
          <Text style={brand}>TESLYS</Text>
          <Text style={tagline}>The Tesla Hosting Platform</Text>
        </Section>

        <Container style={container}>
          <Section style={card}>
            <Text style={hero}>🔐 Verification Required</Text>
            <Heading style={h1}>Confirm it's really you</Heading>
            <Text style={text}>
              Use the verification code below to confirm your identity. This code expires in
              <strong> 10 minutes</strong>.
            </Text>
            <Section style={codeWrap}>
              <Text style={codeLabel}>YOUR CODE</Text>
              <Text style={codeStyle}>{token}</Text>
            </Section>

            <Hr style={divider} />

            <Section style={securityBox}>
              <Text style={securityTitle}>🛡️ Didn't request this?</Text>
              <Text style={securityText}>
                Never share this code with anyone — TESLYS staff will never ask for it.
                If you didn't request this code, ignore this email and consider changing
                your password.
              </Text>
            </Section>
          </Section>

          <Section style={trustBar}>
            <Text style={trustText}>🔒 Secured by TESLYS · Bank-level encryption</Text>
          </Section>
          <Text style={legal}>
            © {new Date().getFullYear()} TESLYS · The Tesla Hosting Platform
            <br />
            Need help? Email <Link href="mailto:support@teslys.app" style={legalLink}>support@teslys.app</Link>
          </Text>
        </Container>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f4f6f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: '0', padding: '0' }
const outerContainer = { maxWidth: '600px', margin: '0 auto', padding: '0' }
const headerBand = { background: 'linear-gradient(135deg, #0a2540 0%, #1a8a8a 100%)', padding: '32px 20px', textAlign: 'center' as const }
const brand = { fontSize: '28px', fontWeight: 'bold' as const, color: '#ffffff', letterSpacing: '4px', margin: '0' }
const tagline = { fontSize: '12px', color: '#a8d4d4', letterSpacing: '2px', margin: '6px 0 0', textTransform: 'uppercase' as const }
const container = { maxWidth: '600px', margin: '0 auto', padding: '24px 20px 32px', backgroundColor: '#f4f6f9' }
const card = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '36px 32px', boxShadow: '0 2px 8px rgba(10, 37, 64, 0.06)' }
const hero = { fontSize: '14px', color: '#1a8a8a', fontWeight: 'bold' as const, margin: '0 0 8px', letterSpacing: '1px', textTransform: 'uppercase' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a2540', margin: '0 0 18px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px' }
const codeWrap = { textAlign: 'center' as const, padding: '8px 0 16px' }
const codeLabel = { fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' as const, letterSpacing: '2px', margin: '0 0 8px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '36px', fontWeight: 'bold' as const, color: '#1a8a8a', letterSpacing: '8px', margin: '0', backgroundColor: '#f0fafa', padding: '20px 0', borderRadius: '12px', border: '2px dashed #1a8a8a' }
const divider = { borderColor: '#e5e7eb', margin: '28px 0 20px' }
const securityBox = { backgroundColor: '#fef9f0', border: '1px solid #fde8c4', borderRadius: '10px', padding: '16px' }
const securityTitle = { fontSize: '14px', fontWeight: 'bold' as const, color: '#92580f', margin: '0 0 6px' }
const securityText = { fontSize: '13px', color: '#78350f', margin: '0', lineHeight: '1.5' }
const trustBar = { backgroundColor: '#f0fafa', border: '1px solid #d1eded', borderRadius: '10px', padding: '14px', textAlign: 'center' as const, margin: '20px 0 16px' }
const trustText = { fontSize: '12px', color: '#1a8a8a', margin: '0', fontWeight: '600' as const }
const legal = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: '16px 0 0', lineHeight: '1.6' }
const legalLink = { color: '#94a3b8', textDecoration: 'underline' }
