# BiteBill

BiteBill helps freelancers, consultants, and small businesses create professional invoices, track payments, and understand their revenue without juggling spreadsheets or separate tools. It is a full-stack invoicing application that brings client management, invoice generation, PDF exports, public sharing, recurring billing, and analytics into one clean workspace.

## Overview

BiteBill solves a common problem for solo professionals and small agencies: staying on top of who owes what, when payment is due, and how the business is performing. Users can onboard quickly, add clients, create branded invoices, and share payment links with customers. The dashboard turns raw invoice data into revenue trends and status breakdowns, while the analytics workspace gives deeper insights into client performance and outstanding balances.

The project is built with a strong focus on type safety, accessibility, and a polished user experience. Every invoice action is logged, totals are calculated on the server, and sensitive data is never exposed across user boundaries.

## System Architecture

BiteBill follows a modern layered architecture. The application serves the marketing site, protected dashboard, and API routes. Route handlers enforce authentication and delegate business logic to feature services backed by a PostgreSQL database.

```mermaid
flowchart LR
    Browser["Web Browser"]
    NextApp["Next.js App"]
    Auth["Auth Provider"]
    Api["API Route Handlers"]
    Services["Feature Services"]
    DB[("PostgreSQL")]
    PDF["PDF Generator"]
    Cron["Cron / Scheduler"]

    Browser --> NextApp
    NextApp --> Auth
    NextApp --> Api
    Api --> Services
    Services --> DB
    Services --> PDF
    Cron --> Api

    style Browser fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style NextApp fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Auth fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff
    style Api fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Services fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style DB fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style PDF fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Cron fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff
```

## Features

### Invoice Management

Create, edit, and send invoices with itemized line entries, tax rates, discounts, and payment terms. Invoices move through statuses like draft, pending, paid, and overdue. All totals are computed on the server so clients cannot tamper with amounts.

```mermaid
sequenceDiagram
    actor User
    participant Form
    participant API
    participant Service
    participant DB

    User->>Form: Fill invoice details
    Form->>API: Submit invoice payload
    API->>Service: Validate and compute totals
    Service->>DB: Save invoice and items
    DB->>Service: Confirm save
    Service->>API: Return invoice
    API->>Form: Update cache and UI
    Form->>User: Show invoice
```

### Branded PDF Generation

Generate print-ready PDFs from invoice data using custom branding, logos, and one of three templates: Classic, Modern, or Corporate. PDFs include line items, totals, payment terms, and status watermarks.

```mermaid
sequenceDiagram
    actor User
    participant App
    participant PDFAPI
    participant PDFService
    participant Storage

    User->>App: Click Download PDF
    App->>PDFAPI: Request PDF
    PDFAPI->>PDFService: Generate document
    PDFService->>Storage: Fetch branding and logo
    Storage->>PDFService: Return assets
    PDFService->>PDFService: Render template
    PDFService->>PDFAPI: Return PDF bytes
    PDFAPI->>App: Serve attachment
    App->>User: Save file
```

### Recurring Invoices

Set up monthly, quarterly, or yearly invoice schedules. BiteBill automatically generates invoices when the next run date arrives, and users can trigger ad-hoc generation at any time.

```mermaid
sequenceDiagram
    participant Cron
    participant API
    participant Service
    participant DB

    Cron->>API: Trigger due schedules
    API->>Service: Find due templates
    Service->>DB: Query active templates
    DB->>Service: Return due templates
    Service->>Service: Generate invoice
    Service->>DB: Update next run date
    Service->>DB: Save generated invoice
    Service->>API: Return results
```

### Public Invoice Sharing

Share invoices with clients through secure, read-only links. Recipients can view the invoice and download the PDF without needing an account. Share links can have expiration dates, and view counts are tracked.

### Client Management

Keep a directory of clients with contact details, addresses, and notes. Each client page shows billing history, outstanding balances, and invoice health.

### Dashboard and Analytics

The dashboard provides a quick revenue snapshot, status distribution charts, recent invoices, and activity timelines. The analytics workspace adds revenue trends, accounts receivable aging, and a client performance leaderboard.

## Technologies Used

| Technology                                          | Purpose                    |
| --------------------------------------------------- | -------------------------- |
| [Next.js](https://nextjs.org/)                      | Full-stack React framework |
| [TypeScript](https://www.typescriptlang.org/)       | Type-safe JavaScript       |
| [Tailwind CSS](https://tailwindcss.com/)            | Utility-first styling      |
| [Neon PostgreSQL](https://neon.tech/)               | Serverless database        |
| [Drizzle ORM](https://orm.drizzle.team/)            | Database toolkit           |
| [Better Auth](https://www.better-auth.com/)         | Authentication             |
| [TanStack Query](https://tanstack.com/query/latest) | Server state management    |
| [Zustand](https://zustand.docs.pm/)                 | Client state management    |
| [React Hook Form](https://react-hook-form.com/)     | Form handling              |
| [Zod](https://zod.dev/)                             | Schema validation          |
| [Recharts](https://recharts.org/)                   | Data visualization         |
| [pdf-lib](https://pdf-lib.js.org/)                  | PDF generation             |
| [Framer Motion](https://www.framer.com/motion/)     | Animations                 |
| [date-fns](https://date-fns.org/)                   | Date utilities             |

## Author Info

Built by Emmanuel Ihemedu.

- [LinkedIn](https://linkedin.com/in/emmanuel-ihemedu)
- [X (Twitter)](https://x.com/deraamaobi)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-000000?style=for-the-badge&logo=drizzle&logoColor=white)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-000000?style=for-the-badge)](https://www.better-auth.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://zustand.docs.pm/)
[![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)](https://react-hook-form.com/)
[![Zod](https://img.shields.io/badge/Zod-3E67A8?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)](https://recharts.org/)
[![pdf-lib](https://img.shields.io/badge/pdf--lib-EC1C24?style=for-the-badge)](https://pdf-lib.js.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![date-fns](https://img.shields.io/badge/date--fns-770C56?style=for-the-badge&logo=datefns&logoColor=white)](https://date-fns.org/)
