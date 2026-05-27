/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

export interface HostApplicationReceivedProps {
  name?: string
  companyName?: string
}

export const HostApplicationReceivedEmail = ({
  name,
  companyName,
}: HostApplicationReceivedProps) => {
  const greeting = name ? `Hi ${name},` : 'Hi there,'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>We received your Teslys host application</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={header}>
            <Text style={brand}>TESLYS</Text>
            <Text style={tagline}>Host Application Received</Text>
          </Section>
          <Container style={container}>
            <Section style={card}>
              <Heading style={h1}>Thanks for applying to Teslys{companyName ? `, ${companyName}` : ''}!</Heading>
              <Text style={text}>{greeting}</Text>
              <Text style={text}>
                We've received your application to have our team manage your Tesla(s).
                A real human will review your submission and get back to you shortly.
              </Text>
              <Section style={info}>
                <Text style={infoTitle}>What happens next</Text>
                <Text style={row}>• Our team reviews your application within 1–3 business days.</Text>
                <Text style={row}>• Due to very high demand, we currently operate a short waitlist — but a member of our team will personally reach out to you as soon as possible.</Text>
                <Text style={row}>• Have your vehicle details handy when we call so we can move quickly.</Text>
              </Section>
              <Text style={text}>
                In the meantime, if you have any questions, just reply to this email or reach us at{' '}
                <Link href="mailto:support@teslys.com" style={link}>support@teslys.com</Link>.
              </Text>
              <Hr style={divider} />
              <Text style={footer}>
                Talk soon,<br />The Teslys Team
              </Text>
            </Section>
            <Text style={legal}>
              © {new Date().getFullYear()} TESLYS · <Link href="https://teslys.app" style={legalLink}>teslys.app</Link>
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  )
}

export default HostApplicationReceivedEmail

export const template = {
  component: HostApplicationReceivedEmail,
  subject: 'We received your Teslys host application',
  displayName: 'Host: Application received',
  previewData: { name: 'Jordan', companyName: 'Skyline Auto' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: '0', padding: '0' }
const outer = { maxWidth: '600px', margin: '0 auto' }
const header = { background: 'linear-gradient(135deg, #0a2540 0%, #1a8a8a 100%)', padding: '28px 20px', textAlign: 'center' as const }
const brand = { fontSize: '24px', fontWeight: 'bold' as const, color: '#ffffff', letterSpacing: '4px', margin: '0' }
const tagline = { fontSize: '11px', color: '#a8d4d4', letterSpacing: '2px', margin: '4px 0 0', textTransform: 'uppercase' as const }
const container = { maxWidth: '600px', margin: '0 auto', padding: '24px 20px 32px' }
const card = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px 28px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a2540', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px' }
const info = { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 18px', margin: '8px 0 20px' }
const infoTitle = { fontSize: '13px', fontWeight: 'bold' as const, color: '#0a2540', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const row = { fontSize: '14px', color: '#0a2540', margin: '6px 0', lineHeight: '1.5' }
const link = { color: '#1a8a8a', textDecoration: 'underline' }
const divider = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const footer = { fontSize: '14px', color: '#475569', margin: '0', lineHeight: '1.5' }
const legal = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: '14px 0 0' }
const legalLink = { color: '#94a3b8', textDecoration: 'underline' }
