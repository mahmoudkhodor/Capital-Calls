# Startup Deal Room Platform

A web platform for managing startup applications, investor deal rooms, and introductions.

## Features

### For Startups
- Multi-step application form with company, team, product, metrics, and fundraising sections
- Upload pitch decks and documents
- Track application status (Submitted / In Review / Shortlisted / Not Moving Forward)
- View dashboard with score and status

### For Admins
- View all startup applications in a pipeline table
- Score startups (0-100) with rubric fields
- Create and manage deal rooms
- Add startups to deal rooms
- Invite investors and assign to deal rooms
- Configure field visibility per deal room
- Approve/reject intro requests

### For Investors
- View curated startups in deal rooms they have access to
- Filter by sector and stage
- Express interest in startups
- Request introductions
- Track intro status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (credentials provider)
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Clone and Install

```bash
cd /Users/mahmoud/Desktop/Code/Test\ claude\ 1
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `.env` with your database connection string:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/startup_dealroom?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Startup | startup@example.com | startup123 |
| Investor | investor@example.com | investor123 |

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth
│   │   │   ├── dealrooms/
│   │   │   ├── intros/
│   │   │   ├── startups/
│   │   │   └── invite/
│   │   ├── admin/         # Admin pages
│   │   ├── startup/       # Startup pages
│   │   ├── investor/       # Investor pages
│   │   ├── apply/          # Application form
│   │   ├── login/          # Login page
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   ├── lib/
│   │   ├── auth.ts         # NextAuth config
│   │   └── prisma.ts       # Prisma client
│   └── types/              # TypeScript types
├── .env.example
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Startups
- `GET /api/startups` - List all startups (admin)
- `POST /api/startups/register` - Register new startup
- `PATCH /api/startups` - Update startup (admin)

### Deal Rooms
- `GET /api/dealrooms` - List deal rooms (admin)
- `POST /api/dealrooms` - Create deal room (admin)
- `GET /api/dealrooms/[id]` - Get deal room (investor with access)
- `PATCH /api/dealrooms/[id]` - Update deal room (admin)

### Intros
- `GET /api/intros` - List intros
- `POST /api/intros` - Request intro (investor)
- `PATCH /api/intros` - Approve/reject intro (admin)

### Invite
- `POST /api/invite` - Invite investor (admin)

## Workflows

### Startup Application
1. Visit `/apply`
2. Fill multi-step form
3. Submit application
4. Status changes: DRAFT → SUBMITTED → IN_REVIEW → SHORTLISTED

### Admin Review
1. Login as admin
2. View all applications in `/admin`
3. Score and tag startups
4. Create deal rooms at `/admin/dealrooms`
5. Add startups to deal rooms
6. Invite investors

### Investor Flow
1. Login as investor (invited by admin)
2. View deal rooms at `/investor`
3. Browse startups in deal room
4. Request intro
5. Wait for admin approval
6. See approved intros

## Email (Dev Stub)

Emails are logged to console in development mode. To implement real emails:
1. Add email provider (SendGrid, AWS SES, etc.)
2. Update `/src/lib/email.ts` with provider logic
3. Replace console.log calls with email function calls

## License

MIT
