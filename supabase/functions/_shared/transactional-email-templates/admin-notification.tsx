/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text, Button,
} from 'npm:@react-email/components@0.0.22'

export interface AdminNotificationProps {
  kind?: 'client' | 'host' | 'inquiry'
  name?: string
  email?: string
  phone?: string
  company?: string
  services?: string
  coverage?: string
  amount?: string
  message?: string
  reviewUrl?: string
}

export const AdminNotificationEmail = ({
  kind = 'client',
  name = 'New user',
  email = '',
  phone = '',
  company = '',
  services = '',
  coverage = '',
  amount = '',
  message = '',
  reviewUrl = 'https://teslys.app/admin/manage-accounts',
}: AdminNotificationProps) => {
  const isHost = kind === 'host'
  const isInquiry = kind === 'inquiry'
  const title = isInquiry
    ? 'New Investor Inquiry'
    : isHost
      ? 'New Host Application'
      : 'New Client Registration'
  const subtitle = isInquiry
    ? 'A new investor has submitted an inquiry through the TESLYS investor page.'
    : isHost
      ? 'A new host has applied to join TESLYS and is awaiting your approval.'
      : 'A new client has just registered on the TESLYS platform.'
  const ctaLabel = isInquiry ? 'View Inquiries' : isHost ? 'Review Application' : 'Review Account'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{title}: {name}</Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={header}>
            <Text style={brand}>TESLYS</Text>
            <Text style={tagline}>Admin Notification</Text>
          </Section>
          <Container style={container}>
            <Section style={card}>
              <Heading style={h1}>{title}</Heading>
              <Text style={text}>{subtitle}</Text>
              <Section style={info}>
                <Text style={row}><strong>Name:</strong> {name}</Text>
                {company ? <Text style={row}><strong>Company:</strong> {company}</Text> : null}
                {email ? <Text style={row}><strong>Email:</strong> <Link href={`mailto:${email}`} style={link}>{email}</Link></Text> : null}
                {phone ? <Text style={row}><strong>Phone:</strong> <Link href={`tel:${phone}`} style={link}>{phone}</Link></Text> : null}
                {amount ? <Text style={row}><strong>Interested amount:</strong> {amount}</Text> : null}
                {message ? <Text style={row}><strong>Message:</strong> {message}</Text> : null}
                {services ? <Text style={row}><strong>Services:</strong> {services}</Text> : null}
                {coverage ? <Text style={row}><strong>Coverage:</strong> {coverage}</Text> : null}
              </Section>
              <Section style={btnWrap}>
                <Button style={button} href={reviewUrl}>{ctaLabel} →</Button>
              </Section>
              <Hr style={divider} />
              <Text style={footer}>
                Reach out to the {isInquiry ? 'investor' : isHost ? 'host' : 'client'} promptly to convert this lead.
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

export default AdminNotificationEmail

import type { TemplateEntry } from './registry.ts'

export const template = {
  component: AdminNotificationEmail,
  subject: (data: AdminNotificationProps) =>
    `${data?.kind === 'host' ? 'New Host Application' : 'New Client Registration'}: ${data?.name ?? 'New user'}`,
  displayName: 'Admin: New account notification',
  previewData: { kind: 'client', name: 'Jane Doe', email: 'jane@example.com', phone: '+15555550100' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f4f6f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif', margin: '0', padding: '0' }
const outer = { maxWidth: '600px', margin: '0 auto' }
const header = { background: 'linear-gradient(135deg, #0a2540 0%, #1a8a8a 100%)', padding: '28px 20px', textAlign: 'center' as const }
const brand = { fontSize: '24px', fontWeight: 'bold' as const, color: '#ffffff', letterSpacing: '4px', margin: '0' }
const tagline = { fontSize: '11px', color: '#a8d4d4', letterSpacing: '2px', margin: '4px 0 0', textTransform: 'uppercase' as const }
const container = { maxWidth: '600px', margin: '0 auto', padding: '24px 20px 32px' }
const card = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px 28px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0a2540', margin: '0 0 12px' }
const text = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px' }
const info = { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px 18px', margin: '8px 0 20px' }
const row = { fontSize: '14px', color: '#0a2540', margin: '6px 0', lineHeight: '1.5' }
const link = { color: '#1a8a8a', textDecoration: 'underline' }
const btnWrap = { textAlign: 'center' as const, padding: '8px 0' }
const button = { backgroundColor: '#1a8a8a', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const divider = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const footer = { fontSize: '13px', color: '#94a3b8', margin: '0', lineHeight: '1.5' }
const legal = { fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const, margin: '14px 0 0' }
const legalLink = { color: '#94a3b8', textDecoration: 'underline' }
