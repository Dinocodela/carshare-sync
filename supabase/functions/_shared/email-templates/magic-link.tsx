/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure TESLYS login link is ready</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={headerBand}>
          <Text style={brand}>TESLYS</Text>
          <Text style={tagline}>The Tesla Hosting Platform</Text>
        </Section>

        <Container style={container}>
          <Section style={card}>
            <Text style={hero}>🔑 Secure Login</Text>
            <Heading style={h1}>Tap to sign in</Heading>
            <Text style={text}>
              Click the button below to securely access your <strong>{siteName}</strong> account.
              No password needed — this link is valid for the next 60 minutes and can only be used once.
            </Text>
            <Section style={buttonWrap}>
              <Button style={button} href={confirmationUrl}>
                Log In Securely →
              </Button>
            </Section>
            <Text style={smallLink}>
              Or copy this link into your browser:
              <br />
              <Link href={confirmationUrl} style={rawLink}>{confirmationUrl}</Link>
            </Text>

            <Hr style={divider} />

            <Section style={securityBox}>
              <Text style={securityTitle}>🛡️ Didn't request this?</Text>
              <Text style={securityText}>
                If you didn't try to log in, ignore this email — your account stays safe.
                Nobody can access your account with just this email.
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

export default MagicLinkEmail

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
const buttonWrap = { textAlign: 'center' as const, padding: '16px 0 12px' }
const button = { backgroundColor: '#1a8a8a', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '16px 32px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(26, 138, 138, 0.3)' }
const smallLink = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '12px 0 0', lineHeight: '1.5', wordBreak: 'break-all' as const }
const rawLink = { color: '#1a8a8a', textDecoration: 'underline' }
const divider = { borderColor: '#e5e7eb', margin: '28px 0 20px' }
const securityBox = { backgroundColor: '#fef9f0', border: '1px solid #fde8c4', borderRadius: '10px', padding: '16px' }
const securityTitle = { fontSize: '14px', fontWeight: 'bold' as const, color: '#92580f', margin: '0 0 6px' }
const securityText = { fontSize: '13px', color: '#78350f', margin: '0', lineHeight: '1.5' }
const trustBar = { backgroundColor: '#f0fafa', border: '1px solid #d1eded', borderRadius: '10px', padding: '14px', textAlign: 'center' as const, margin: '20px 0 16px' }
const trustText = { fontSize: '12px', color: '#1a8a8a', margin: '0', fontWeight: '600' as const }
const legal = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: '16px 0 0', lineHeight: '1.6' }
const legalLink = { color: '#94a3b8', textDecoration: 'underline' }
