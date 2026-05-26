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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new TESLYS email address</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={headerBand}>
          <Text style={brand}>TESLYS</Text>
          <Text style={tagline}>The Tesla Hosting Platform</Text>
        </Section>

        <Container style={container}>
          <Section style={card}>
            <Text style={hero}>📧 Email Change Request</Text>
            <Heading style={h1}>Confirm your new email</Heading>
            <Text style={text}>
              You requested to change your email for <strong>{siteName}</strong>:
            </Text>

            <Section style={changeBox}>
              <Text style={changeLabel}>FROM</Text>
              <Text style={changeValue}>{email}</Text>
              <Text style={changeArrow}>↓</Text>
              <Text style={changeLabel}>TO</Text>
              <Text style={changeValueNew}>{newEmail}</Text>
            </Section>

            <Text style={text}>Click below to confirm this change:</Text>
            <Section style={buttonWrap}>
              <Button style={button} href={confirmationUrl}>
                Confirm Email Change →
              </Button>
            </Section>
            <Text style={smallLink}>
              Or copy this link into your browser:
              <br />
              <Link href={confirmationUrl} style={rawLink}>{confirmationUrl}</Link>
            </Text>

            <Hr style={divider} />

            <Section style={alertBox}>
              <Text style={alertTitle}>⚠️ Didn't request this?</Text>
              <Text style={alertText}>
                If you didn't request this email change, please secure your account immediately
                by resetting your password and contacting our support team.
              </Text>
            </Section>
          </Section>

          <Section style={trustBar}>
            <Text style={trustText}>🔒 Secured by TESLYS · Account safety first</Text>
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

export default EmailChangeEmail

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
const changeBox = { backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center' as const, margin: '0 0 20px' }
const changeLabel = { fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' as const, letterSpacing: '1px', margin: '0 0 4px' }
const changeValue = { fontSize: '15px', color: '#475569', margin: '0 0 12px', fontWeight: '600' as const }
const changeValueNew = { fontSize: '15px', color: '#1a8a8a', margin: '0', fontWeight: 'bold' as const }
const changeArrow = { fontSize: '20px', color: '#1a8a8a', margin: '4px 0', textAlign: 'center' as const }
const buttonWrap = { textAlign: 'center' as const, padding: '16px 0 12px' }
const button = { backgroundColor: '#1a8a8a', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '16px 32px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(26, 138, 138, 0.3)' }
const smallLink = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '12px 0 0', lineHeight: '1.5', wordBreak: 'break-all' as const }
const rawLink = { color: '#1a8a8a', textDecoration: 'underline' }
const divider = { borderColor: '#e5e7eb', margin: '28px 0 20px' }
const alertBox = { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px' }
const alertTitle = { fontSize: '14px', fontWeight: 'bold' as const, color: '#991b1b', margin: '0 0 6px' }
const alertText = { fontSize: '13px', color: '#7f1d1d', margin: '0', lineHeight: '1.5' }
const trustBar = { backgroundColor: '#f0fafa', border: '1px solid #d1eded', borderRadius: '10px', padding: '14px', textAlign: 'center' as const, margin: '20px 0 16px' }
const trustText = { fontSize: '12px', color: '#1a8a8a', margin: '0', fontWeight: '600' as const }
const legal = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: '16px 0 0', lineHeight: '1.6' }
const legalLink = { color: '#94a3b8', textDecoration: 'underline' }
