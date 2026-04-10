You are a senior React developer. Build a complete, production-ready frontend for "AssignPortal" — an Assignment Submission Management System for university lecturers. The UI must be clean, professional, and modern. Use Tailwind CSS for all styling. Use React Router for navigation. Use Axios for all API calls. Store the professor's JWT token in localStorage after login.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKEND API BASE URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Store this in a config file: src/config.ts
export const API_BASE = import.meta.env.VITE_API_URL || "https://your-render-api.onrender.com";

All protected API calls must include:
Authorization: Bearer <token>  (from localStorage key "ap_token")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Colors:
  Primary: #1A3A5C (deep navy)
  Accent:  #C9A84C (gold)
  Success: #16a34a
  Danger:  #dc2626
  Bg:      #F4F7FB (light blue-grey)
  Card:    #FFFFFF

Fonts (import from Google Fonts):
  Display: "Playfair Display" — for headings
  Body:    "DM Sans" — for all other text

Design feel: Academic, trustworthy, clean. Like a university portal but actually pleasant to use. Generous whitespace, navy sidebars, gold accents on CTAs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGES & ROUTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/login                   → Professor Login
/forgot-password         → Forgot Password
/dashboard               → Professor Dashboard (protected)
/assignments/new         → Create Assignment (protected)
/assignments/:id         → Assignment Detail & Submissions (protected)
/submit/:id              → Student Submission Page (PUBLIC — no auth)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 1: /login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Centered card on navy background with LASU crest placeholder
- Title: "AssignPortal" in Playfair Display, gold color
- Subtitle: "Lecturer Portal — Lagos State University"
- Email input
- Password input with show/hide toggle
- "Sign In" button (navy, gold text)
- "Forgot Password?" link below
- On submit: POST /auth/login (form data: email, password)
  - Save token to localStorage as "ap_token"
  - Redirect to /dashboard
  - Show error toast on failure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 2: /forgot-password
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Simple card: email input + "Send Reset Link" button
- POST /auth/forgot-password (form data: email)
- Show success message: "Check your email for a reset link"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 3: /dashboard (PROTECTED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: Left sidebar (navy) + main content area

Sidebar contains:
- AssignPortal logo/name
- Nav: Dashboard, Create Assignment, Logout

Main content:
- Header: "My Assignments" in Playfair Display
- Stats row: Total Assignments | Total Submissions (across all) | Active (deadline not passed)
- "Create New Assignment" button (gold)
- Assignments list as cards. Each card shows:
  - Course name + Assignment title
  - Type badge: "Individual" or "Group" (colored pill)
  - Deadline (formatted: "Mon 7 Apr 2025 · 6:00 PM")
  - Deadline status: green "Open" or red "Closed"
  - Submission count
  - Buttons: "View Submissions" | "Copy Submission Link" | Delete

- GET /assignments to load all assignments
- Copy submission link: copies https://yourdomain.com/submit/<id> to clipboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 4: /assignments/new (PROTECTED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Form to create a new assignment:
- Course Name (text input) e.g. "MAT102"
- Assignment Title (text input)
- Submission Type: toggle/radio — "Individual" or "Group"
- If Group selected: show "Number of Groups" number input
- Deadline: date picker + time picker
- "Create Assignment" button

On submit: POST /assignments (form data)
Redirect to /dashboard on success with a toast: "Assignment created! Share the submission link with your students."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 5: /assignments/:id (PROTECTED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the main working page for the professor. Sections:

── Header ──
- Assignment title + course
- Deadline + status
- "Copy Submission Link" button
- "Download ZIP" dropdown button with options:
  - Download All
  - Download by Group (shows group number input)
  - Download by Department (shows department dropdown)
- "Export Excel" dropdown with options:
  - Export All Departments (downloads ZIP of Excels)
  - Export by Department (shows department dropdown, downloads single Excel)

── Filters bar ──
- Filter by Department dropdown (populated from /departments)
- Filter by Group Number input (only visible if assignment type is "group")
- Search by name or matric number (client-side filter)
- "Upload Class List" button (opens modal)

── Stats ──
- Total submissions | By group/dept breakdown | Late submissions count

── Submissions Table ──
Columns: S/N | Full Name | Matric Number | Department | Group | Submitted At | Late? | Score | File | Actions

- Late submissions highlighted with a red left border on the row
- Score column: inline editable input field. On blur/enter: PATCH /submissions/:id/score
- File column: "View File" button that opens file_url in new tab
- Pagination (25 per page)

── Upload Class List Modal ──
- File input for CSV upload
- Expected format shown: full_name, matric_number, department
- POST /assignments/:id/classlist
- After upload, show results:
  - Total in class list
  - Submitted count
  - Missing students list (name + matric + department)
  - Option to download missing list as CSV

API calls:
- GET /assignments/:id → assignment details
- GET /submissions/:id?department=&group_number= → submissions (with filter params)
- GET /departments → for filter dropdown

Download ZIP:
- GET /download/:id/zip?mode=all
- GET /download/:id/zip?mode=group&filter_value=1
- GET /download/:id/zip?mode=department&filter_value=Biology+Education
(Trigger file download in browser using blob URL)

Export Excel:
- GET /export/:id/excel → downloads ZIP of all department Excels
- GET /export/:id/excel?department=Biology+Education → single Excel
(Same blob download approach)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 6: /submit/:id (PUBLIC — NO AUTH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This page is what students open. Clean, mobile-friendly, friendly tone.

On load: GET /assignments/:id
Show: course name, assignment title, deadline countdown timer (live)

If deadline has passed: show a red banner "Submissions Closed — Deadline was [date]" and disable the form entirely.

Form fields:
1. Full Name (text)
2. Matric Number (text, auto-uppercased)
3. Department (dropdown — fetched from GET /departments)
4. Group Number (number input — only show if assignment type is "group")
5. File Upload (drag-and-drop zone accepting PDF, DOC, DOCX only)
   - Show file name after selection
   - Show file size
   - Reject other file types with an inline error

Submit button: "Submit Assignment"

On submit: POST /submissions/:id (multipart form data)
- Show loading spinner on button
- On success: show full-page success screen:
  - Green checkmark animation
  - "Submission Received!"
  - Student's name, matric, submitted time
  - "You may now close this tab"
- On error (duplicate matric, wrong file type, deadline passed): show clear error message inline

Design for this page: lighter, student-friendly. Use white background, navy accents. Show a progress bar for file upload. Make it work perfectly on mobile.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHARED COMPONENTS TO BUILD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Toast notification system (top-right, auto-dismiss after 4s)
  Types: success (green), error (red), info (navy)
- LoadingSpinner component
- ProtectedRoute component (checks localStorage for "ap_token", redirects to /login if missing)
- DownloadButton component (handles blob download from API response)
- Modal component (reusable)
- Sidebar layout component

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AXIOS SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create src/api/axios.ts:
- Base URL from config
- Request interceptor: attach Authorization header from localStorage "ap_token"
- Response interceptor: if 401 → clear token + redirect to /login

For file downloads (ZIP/Excel), use axios with responseType: 'blob', then:
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENVIRONMENT VARIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In .env:
VITE_API_URL=https://your-render-app.onrender.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- /submit/:id must work WITHOUT any authentication. Do not wrap it in ProtectedRoute.
- All form submissions to the backend use FormData (multipart), NOT JSON body.
- The deadline countdown on the student page must count down live using setInterval.
- Score inputs should save on blur (when professor clicks away) or on Enter key.
- All download operations (ZIP, Excel) must properly trigger browser file download.
- Mobile responsiveness is essential for the student submission page (/submit/:id).
- Use React Query or useState/useEffect for data fetching — your choice.
- Handle loading and error states on every data fetch.

Build all pages fully. Do not leave any placeholders or TODO comments.
