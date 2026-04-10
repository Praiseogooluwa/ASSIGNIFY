# AssignPortal — Setup Guide
## Complete steps from zero to deployed

---

## STEP 1 — Supabase Setup

1. Go to https://supabase.com and create a new project
   - Name: assignportal
   - Region: closest to Nigeria (Europe West is fine)
   - Note your Project URL and keys

2. In Supabase Dashboard → SQL Editor → New Query
   - Paste the entire contents of `schema.sql` and run it

3. Go to Project Settings → API
   - Copy: Project URL → this is your SUPABASE_URL
   - Copy: service_role key → SUPABASE_SERVICE_KEY (keep secret!)
   - Copy: anon key → SUPABASE_ANON_KEY
   - Copy: JWT Secret → JWT_SECRET

4. Go to Authentication → Email Templates
   - The "Reset Password" email is already configured by Supabase
   - Change the redirect URL to your frontend URL in: Auth → URL Configuration → Site URL

---

## STEP 2 — Deploy FastAPI to Render

1. Push the backend folder to a GitHub repo (e.g., assignportal-api)

2. Go to https://render.com → New → Web Service
   - Connect your GitHub repo
   - Name: assignportal-api
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. Add Environment Variables in Render dashboard:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - SUPABASE_ANON_KEY
   - JWT_SECRET (paste from Supabase Project Settings → API → JWT Secret)

4. Deploy. Your API URL will be: https://assignportal-api.onrender.com

5. Test it: visit https://assignportal-api.onrender.com/health
   Should return: {"status": "ok"}

---

## STEP 3 — Build Frontend with Lovable

1. Go to https://lovable.dev → New Project

2. Paste the entire contents of `LOVABLE_PROMPT.md` as your first message

3. After Lovable generates the code:
   - Set the VITE_API_URL environment variable to your Render URL
   - Go to Project Settings in Lovable → Environment Variables
   - Add: VITE_API_URL = https://assignportal-api.onrender.com

4. Deploy the frontend via Lovable (it deploys to Netlify or their own hosting)

---

## STEP 4 — Create Professor Account

1. Go to Supabase Dashboard → Authentication → Users → Add User
   - Email: professor's email
   - Password: set a strong password
   - Click "Create User"

2. Send the professor the login URL and credentials

---

## STEP 5 — Test the Full Flow

1. Login as professor at /login
2. Create an assignment
3. Copy the submission link (e.g., yourdomain.com/submit/abc-123)
4. Open it in a different browser (or incognito) as a student
5. Submit a test file
6. Go back to professor dashboard → view submission → download ZIP → export Excel

---

## HOW IT WORKS — Quick Summary

STUDENT FLOW:
  Student opens /submit/:id
  → Fills form + uploads file
  → File is renamed automatically: Course_Assignment_Matric_Name.pdf
  → Saved to Supabase Storage
  → Submission logged in database

PROFESSOR FLOW:
  Logs in → Creates assignment → Shares link
  → Views all submissions filtered by dept/group
  → Scores students inline
  → Downloads organized ZIP or per-department Excel files

---

## TROUBLESHOOTING

"CORS error" → Make sure your Render backend has your frontend URL in allow_origins
"401 Unauthorized" → JWT_SECRET must exactly match what's in Supabase Project Settings
"File upload fails" → Check that the 'submissions' storage bucket is set to Public in Supabase
"Render sleeps after 15 mins" → Free tier Render spins down. Upgrade to $7/mo to avoid cold starts
