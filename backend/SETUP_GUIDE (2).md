# Assignify — Full Setup Guide
# From zero to working in ~30 minutes

═══════════════════════════════════════════════
STEP 1 — SUPABASE SETUP
═══════════════════════════════════════════════

1. Go to https://supabase.com → New Project
   - Name: assignify
   - Choose a strong database password
   - Region: Europe West (closest to Nigeria)
   - Wait ~2 minutes for it to spin up

2. Run the database schema:
   - Go to: SQL Editor → New Query
   - Paste the ENTIRE contents of schema.sql
   - Click "Run"
   - You should see "Success" with no errors

3. Set up OTP email verification (for registration):
   - Go to: Authentication → Email Templates
   - Click "Confirm signup"
   - Change the template type from "Magic Link" to "OTP"
   - IMPORTANT: Supabase → Auth → Providers → Email
     → Disable "Confirm email" if you want instant login after OTP verify
     OR keep it enabled (recommended)

4. Get your API keys:
   - Go to: Project Settings → API
   - Copy "Project URL" → this is SUPABASE_URL
   - Copy "service_role" key (secret) → this is SUPABASE_SERVICE_KEY
   - Keep the service key secret! Never put it in frontend code.

5. Set your site URL for password reset emails:
   - Go to: Authentication → URL Configuration
   - Site URL: https://your-lovable-app-url.lovable.app
   - Add to Redirect URLs: https://your-lovable-app-url.lovable.app/**


═══════════════════════════════════════════════
STEP 2 — DEPLOY BACKEND TO RENDER
═══════════════════════════════════════════════

1. Create a new GitHub repo (e.g. "assignify-api")
   - Push these files to it: main.py, requirements.txt, render.yaml, .env.example

2. Go to https://render.com → Sign up/Login → New → Web Service
   - Connect your GitHub account
   - Select the assignify-api repo
   - Name: assignify-api
   - Region: Frankfurt (closest to Nigeria)
   - Branch: main
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   - Instance Type: Free

3. Add Environment Variables (in Render dashboard → Environment):
   SUPABASE_URL        = https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY = your-service-role-key

4. Click "Create Web Service" → wait for deployment (~3 mins)

5. Test it:
   - Visit: https://assignify-api.onrender.com/health
   - Should return: {"status":"ok","app":"Assignify"}
   - Visit: https://assignify-api.onrender.com/departments
   - Should return the list of LASU departments

   ⚠️ FREE RENDER TIP: Free tier sleeps after 15 mins of inactivity.
   First request after sleep takes ~30 seconds. To avoid this, upgrade to
   the $7/month "Starter" plan or use a free uptime monitor like UptimeRobot.


═══════════════════════════════════════════════
STEP 3 — CONNECT FRONTEND (LOVABLE)
═══════════════════════════════════════════════

1. In your cloned repo, create a .env file:
   VITE_API_URL=https://assignify-api.onrender.com

2. OR set it in Lovable:
   - Go to Lovable project settings
   - Environment Variables → Add:
     VITE_API_URL = https://assignify-api.onrender.com

3. Push your local changes to GitHub:
   git add .
   git commit -m "connect to backend"
   git push

4. Lovable will auto-redeploy.


═══════════════════════════════════════════════
STEP 4 — TEST THE FULL FLOW
═══════════════════════════════════════════════

Test Registration:
1. Open your Lovable app → /register
2. Fill in full name, email, password → "Create Account"
3. You'll see the OTP screen — check your email for a 6-digit code
4. Enter the code → you're logged in and redirected to dashboard

Test Assignment Creation:
1. Dashboard → "Create New Assignment"
2. Fill in: Course Name, Title, Type (Individual/Group), Deadline
3. Submit → you're redirected to dashboard
4. Your assignment appears with "Open" status

Test Student Submission:
1. Click "Copy Link" on the assignment card
2. Open that link in incognito / different browser
3. Fill in student details and upload a PDF
4. Submit → success screen appears

Test Downloads:
1. Go back to professor dashboard → click "View" on the assignment
2. Try "Download ZIP" → All
3. Try "Export Excel" → Export All Departments
4. Files should download correctly

Test Scoring:
1. In assignment detail, click into the Score column for any student
2. Type a number, press Enter or click away
3. Score is saved automatically


═══════════════════════════════════════════════
STEP 5 — GIVE PROFESSOR ACCESS
═══════════════════════════════════════════════

Option A — Professor self-registers:
- Send them the link → they go to /register
- They create their own account with email + password
- Done.

Option B — You create account for them:
- Supabase Dashboard → Authentication → Users → Add User
- Enter their email + temporary password
- Send them login credentials
- They can reset password via /forgot-password


═══════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════

"CORS error in browser console"
→ Your Render backend needs your frontend URL. The current config uses allow_origins=["*"]
  which allows everything. If you want to restrict it later, change "*" to your Lovable URL.

"Login fails with 401"
→ Make sure email is confirmed in Supabase. Check Authentication → Users and look for
  a red "Unconfirmed" badge next to the email. If unconfirmed, user needs to verify OTP first.

"File upload fails"
→ Check Supabase → Storage → submissions bucket exists and is set to Public.
  If bucket wasn't created by the SQL, create it manually:
  Storage → New Bucket → Name: submissions → Public: YES

"OTP email not arriving"
→ Check spam folder. Supabase uses their own email by default (limited to 4/hour on free tier).
  For production, set up a custom SMTP in Supabase → Project Settings → Auth → SMTP Settings.
  You can use Resend.com (free tier: 3000 emails/month).

"Render app sleeping / slow first load"
→ This is normal on the free tier. First request after inactivity takes ~30 seconds.
  Sign up for UptimeRobot (free) to ping your API every 5 minutes and keep it awake.
  URL to monitor: https://assignify-api.onrender.com/health

"score column shows error"
→ Make sure you're typing a valid number in the score field. The backend expects a float.

i actually want insane

i dont want supabase to be showing 

imagine other tech students wants to view and they see me as amateur 

i want everythung to look standard even the color and ui and all other thing you think can be added i sent you the repo when i made it public so you have idea of the repo i made it private 

so aside the .env login.tsx Register.tsx i no really change anything and your the one that helped with  the changing sef i want the cupy submission link to actauuly copy link not jjst show nothing i want the lecturer t have a ability of even writing assignment instructions and student can view it on their end for student that couldnt listen in class 

the teacheer can wish not to put assignemnt instructuons or not and the student can view it like on the student side it should be something like view assignment or download asignment and once they click the button it should just open a page with the instruction not like another page with link just like i unfold a wrapped paper to view an assignment on a page not going to another page or link 

something beautiful 

lovable ui sucks ngl 

make  evrything look professional before i start with the deployment 
