# Assignify — Smart Assignment Management for Nigerian Universities

**Live:** [assignify.com.ng](https://assignify.com.ng)

Assignify is a full-stack web application that helps Nigerian university lecturers create assignments, collect student submissions, and generate CA reports — without WhatsApp chaos, email threads or manual spreadsheets.

---

## The Problem

Nigerian university lecturers share assignments via WhatsApp groups. Students submit files through email. CA collation happens manually in Excel. A 400L student with a carryover in a 100L course has no reliable way to even know an assignment was posted.

Assignify fixes this with one shareable link.

---

## Features

- **Create assignments** — set course, title, deadline, individual or group submission
- **Student submission** — students submit PDF/DOC/DOCX via a public link, no account needed
- **Live dashboard** — see submission count, late submissions, department breakdown
- **Class list upload** — upload your register in Excel, Word, PDF or CSV to instantly see who is missing
- **Collation reports** — select multiple assignments, filter by department or level, download department-by-department Excel CA report
- **ZIP download** — download all submissions organized by department/group
- **Score tracking** — assign scores to individual submissions
- **Assignment levels** — tag assignments as 100L, 200L etc. for accurate CA filtering
- **Admin panel** — super-admin can view all lecturers and impersonate accounts
- **Branded emails** — OTP verification and password reset emails sent from `noreply@assignify.com.ng`

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- React Router v6

**Backend**
- FastAPI (Python)
- Supabase (PostgreSQL + Auth + Storage)
- openpyxl (Excel generation)
- pdfplumber + python-docx (class list parsing)
- slowapi (rate limiting)
- JWT authentication

**Infrastructure**
- Frontend: Vercel
- Backend: Render
- Database + Auth + Storage: Supabase
- Email delivery: Resend SMTP
- Business email: Zoho Mail
- Domain: TrueHost Nigeria → Vercel DNS

---

## Project Structure

```
ASSIGNIFY/
├── backend/
│   ├── main.py          # FastAPI app — all API endpoints
│   ├── requirements.txt
│   ├── schema.sql       # Supabase PostgreSQL schema
│   ├── .env.example     # Required environment variables
│   └── render.yaml      # Render deployment config
│
└── frontend/
    ├── src/
    │   ├── pages/       # All page components
    │   ├── components/  # Shared UI components
    │   ├── api/         # Axios instance + helpers
    │   └── lib/         # Utilities
    ├── public/          # Static assets (favicon, OG image)
    ├── .env.example     # Required environment variables
    └── vercel.json      # Vercel SPA routing fix
```

---

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in your .env values
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

---

## Environment Variables

### Backend (Render / Railway)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (never expose publicly) |
| `SECRET_KEY` | Random hex string for JWT signing — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ADMIN_EMAIL` | Super admin login email |
| `ADMIN_PASSWORD` | Super admin login password |
| `ADMIN_SECRET` | Random string for admin token signing |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your backend deployment URL |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

---

## Database Setup

Run the SQL in `backend/schema.sql` in your Supabase SQL Editor to create all tables, indexes, RLS policies and storage buckets.

If upgrading from a previous version, also run:
```sql
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_level text;
```

---

## Deployment

**Backend → Render:**
1. Connect GitHub repo to Render
2. Set root directory to `backend`
3. Add all environment variables from the table above
4. Deploy

**Frontend → Vercel:**
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

---

## Contact

- Email: support@assignify.com.ng

---

## License

Copyright (c) 2025 Assignify. All rights reserved.

This software and its source code are proprietary and confidential.
Unauthorized copying, distribution, or use is strictly prohibited.