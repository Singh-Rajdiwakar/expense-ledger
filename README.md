# Expense Ledger

Expense Ledger is a secure, AI-assisted personal finance application for tracking income, expenses, accounts, budgets, receipts, and financial insights from one clean dashboard.

The application is built with Next.js, Clerk authentication, Prisma, PostgreSQL, Gemini, Inngest, Resend, Arcjet, Tailwind CSS, and Recharts. It is designed for private financial data, authenticated workflows, server-side data access, and production-ready deployment.

## Key Features

- Secure authentication with Clerk
- Private dashboard scoped to the signed-in user
- Multi-account balance management
- Income and expense transaction tracking
- Category-based expense breakdowns
- Account-level monthly overview
- Spending overview chart with selectable date ranges
- CSV export for transactions
- AI receipt scanning with Gemini
- AI-assisted financial insights with rule-based fallback
- Recurring transaction support
- Budget tracking and alert-ready workflows
- Notification system for account events and insights
- Background workflows powered by Inngest
- Email support through Resend
- API protection with Arcjet

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 |
| UI | React, Tailwind CSS, Radix UI, Lucide Icons |
| Charts | Recharts |
| Authentication | Clerk |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | Google Gemini |
| Background Jobs | Inngest |
| Email | Resend |
| Security | Arcjet |
| Validation | Zod, React Hook Form |

## Project Structure

```text
actions/             Server actions for accounts, dashboard, transactions, email, and insights
app/                 Next.js App Router pages, layouts, API routes, and route groups
components/          Shared UI, dashboard, account, landing, and form components
emails/              React Email templates
hooks/               Reusable React hooks
lib/                 Prisma, auth helpers, formatters, date utilities, AI, notifications, and services
prisma/              Prisma schema and database migrations
public/              Static assets
scripts/             Local test scripts
```

## Requirements

- Node.js 20 LTS or newer
- npm
- PostgreSQL database connection string
- Clerk application
- Gemini API key
- Inngest account or local Inngest setup
- Resend API key for email features
- Arcjet key for request protection

## Environment Variables

Create a `.env.local` file in the project root. Do not commit this file.

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

GEMINI_API_KEY=
GEMINI_RECEIPT_MODEL=gemini-2.5-flash-lite
GEMINI_RECEIPT_FALLBACK_MODELS=
GEMINI_MODEL=
GEMINI_INSIGHTS_MODEL=
ENABLE_GEMINI_INSIGHTS=false

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
INNGEST_DEV=0

RESEND_API_KEY=
ARCJET_KEY=
```

Notes:

- `DATABASE_URL` and `DIRECT_URL` are used by Prisma.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are required for authentication.
- `GEMINI_API_KEY` is required for receipt scanning and optional AI insight generation.
- `ENABLE_GEMINI_INSIGHTS=false` keeps financial insights on the rule-based fallback unless explicitly enabled.
- `.env.local` is already ignored by Git.

## Local Development

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already busy:

```bash
npm run dev -- -p 3013
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run on a custom port:

```bash
npm run start -- -p 3013
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run the configured Next.js lint command |
| `npm run test:spending-averages` | Run spending-average calculation tests |
| `npm run email` | Start the React Email development preview |
| `npm run postinstall` | Generate Prisma client after install |

## Database

The project uses Prisma with PostgreSQL.

Important commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

Use `npx prisma studio` to inspect local database records during development.

## Authentication

Clerk protects private routes and provides user session management.

Required keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

After signing in, users can access account dashboards, transactions, insights, and protected financial data.

## AI Features

Expense Ledger uses Gemini for:

- Receipt scanning
- Transaction extraction from receipt images
- Optional AI-generated financial insight summaries

If Gemini quota is unavailable, the insights system can still use rule-based fallback logic. Receipt scanning requires a valid Gemini API key.

## Background Jobs

Inngest is used for background workflows such as notifications, recurring transaction processing, and report generation.

Required keys:

```env
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

The Inngest endpoint is available at:

```text
/api/inngest
```

## Email

Resend powers email delivery.

```env
RESEND_API_KEY=
```

Email templates are stored in:

```text
emails/
```

## Security

- Authentication is handled by Clerk.
- Database queries are scoped to the authenticated user.
- Account-specific routes verify ownership.
- API protection is configured through Arcjet.
- Environment variables are excluded from Git.
- Generated files, local logs, build artifacts, screenshots, and debug profiles are ignored.

## Deployment

Recommended deployment target: Vercel.

Before deploying:

1. Add all required environment variables to the hosting provider.
2. Connect a production PostgreSQL database.
3. Run Prisma migrations against production.
4. Configure Clerk production URLs.
5. Configure Inngest signing and event keys.
6. Configure Resend domain settings if sending production email.
7. Run `npm run build` locally before pushing.

## Troubleshooting

### Clerk secret key error

Check that `CLERK_SECRET_KEY` is copied from the same Clerk application and environment as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

### Gemini quota error

Gemini free-tier quota can be exhausted. Wait for quota reset, switch to a lower-cost receipt model, or upgrade billing in Google AI Studio.

### Database connection error

Verify `DATABASE_URL` and `DIRECT_URL`, then run:

```bash
npx prisma generate
npx prisma migrate dev
```

### Port already in use

Run the app on another port:

```bash
npm run dev -- -p 3013
```

## License

This project is licensed under the MIT License. See [LICENSE.md](./LICENSE.md).

## Author

Built and maintained by Singh Rajdiwakar.
