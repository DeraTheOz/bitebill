# AGENTS.md

## Project Overview

BiteBill is a production-quality invoicing SaaS application built primarily as a portfolio project while following real-world engineering practices.

Every implementation decision should prioritize:

1. Type Safety
2. Scalability
3. Accessibility
4. Performance
5. User Experience
6. Maintainability

---

# Core Principles

## Type Safety First

- TypeScript strict mode enabled.
- Avoid `any`.
- Prefer inferred types from Zod schemas.
- Use Drizzle-generated types where possible.
- See /docs for various workflow structures.
- Use conventional commit messages.

---

## Server Actions

Do not use Server Actions for business logic.

Preferred architecture:

Client Components
→ TanStack Query
→ Route Handlers
→ Services
→ Drizzle
→ Neon

---

## Data Ownership

Every resource belongs to a user.

Examples:

- Users own Clients.
- Users own Invoices.
- Users own Invoice Settings.
- Users own Branding Settings.

Never expose cross-user data.

---

# Application Modules

## Authentication Module

Responsibilities:

- Registration
- Login
- Logout
- Session Validation
- OAuth

Provider:

- Neon Managed Better Auth

Supported Providers:

- Email/Password
- Google

---

## Dashboard Module

Purpose:

Provide business insights.

Features:

- Revenue Cards
- Status Metrics
- Revenue Trends
- Invoice Distribution

Animations:

- Framer Motion
- Animated Number Counters
- Animated Chart Entrances

---

## Client Module

Purpose:

Store reusable customer information.

Client Fields:

- Name
- Email
- Phone
- Address
- Company
- Notes

Relationships:

User
→ Clients
→ Invoices

---

## Invoice Module

Primary application feature.

Invoice Fields:

- Invoice Number
- Issue Date
- Due Date
- Status
- Client
- Items
- Notes
- Totals

Statuses:

- Draft
- Pending
- Paid
- Overdue

Overdue should be computed automatically.

---

## Invoice Items

Fields:

- Name
- Quantity
- Unit Price
- Total

Invoice totals should always be calculated on the server.

Never trust client calculations.

---

## Activity Timeline Module

Every invoice action creates an event.

Examples:

- Created
- Updated
- Deleted
- Sent
- Marked Paid

Purpose:

Audit trail.

---

## Internal Notes Module

Private notes attached to invoices.

Visible only to invoice owners.

Never exposed publicly.

---

## Public Sharing Module

Generate public URLs.

Example:

/share/[token]

Permissions:

Public:

- View Invoice
- Download PDF

Restricted:

- Edit Invoice
- Delete Invoice

---

## Recurring Invoice Module

Supported Frequencies:

- Monthly
- Quarterly
- Annually

Future invoices generated automatically.

---

## PDF Module

One of the flagship features.

Purpose:

Generate professional documents.

Not screenshots.

Not HTML exports.

Proper PDF documents.

---

### PDF Requirements

Include:

- Company Branding
- Company Logo
- Client Information
- Invoice Information
- Line Items
- Totals
- Terms
- Signature Section

Optional:

- Watermarks
- Tax Breakdown
- Discount Breakdown

---

## Analytics Module

Purpose:

Business intelligence.

Metrics:

- Revenue
- Paid Revenue
- Pending Revenue
- Overdue Revenue
- Invoice Counts

Libraries:

- Recharts
- Framer Motion

---

# State Management

Use Zustand.

Global State Examples:

- Filters
- Modal State
- Sidebar State
- Theme State
- PDF Preferences

Do not store server data in Zustand.

Server data belongs to TanStack Query.

---

# TanStack Query Rules

Use Query Keys.

Examples:

["invoices"]
["invoice", invoiceId]
["clients"]
["dashboard"]

Mutations must invalidate relevant queries.

---

# Form Standards

All forms use:

- React Hook Form
- Zod

Validation occurs:

1. Client-side
2. Server-side

Never trust client validation.

---

# Database Guidelines

Use Drizzle ORM.

Tables:

- users
- sessions
- accounts
- clients
- invoices
- invoice_items
- invoice_events
- recurring_invoices
- branding_settings

Use foreign keys consistently.

---

# UI Standards

Design Goals:

- Clean
- Professional
- Fast
- Accessible

Requirements:

- Mobile First
- Responsive
- Keyboard Accessible
- Proper Loading States
- Proper Error States
- Empty States

---

# Animation Guidelines

Use Framer Motion sparingly.

Allowed:

- Page transitions
- Modal animations
- Dropdown animations
- Chart entrances
- Number counters
- Status changes

Avoid:

- Excessive motion
- Constant animations
- Decorative movement

Animations should communicate state changes.

---

# Performance Goals

Dashboard:
< 2 seconds

Invoice List:
< 1 second

Search:
Debounced

Charts:
Lazy Loaded

PDF Generation:
On Demand

---

# Future Expansion

Potential v2 Features:

- Email Invoices
- Payment Integrations
- Team Accounts
- Multi-Currency Support
- Expense Tracking
- Notification Center
- Webhooks
- API Access
