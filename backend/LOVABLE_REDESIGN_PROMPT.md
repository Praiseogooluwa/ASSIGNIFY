You are a senior React + TypeScript developer. This is a COMPLETE UI OVERHAUL of an existing Assignify app. You must rewrite every page and component with a new design system while keeping ALL existing logic, API calls, and functionality exactly the same.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 DO NOT TOUCH THESE FILES — LEAVE EXACTLY AS IS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- src/pages/Login.tsx
- src/pages/Register.tsx
- src/api/axios.ts
- src/config.ts
- src/App.tsx
- src/main.tsx
- All files in src/components/ui/ (shadcn components)
- All files in src/hooks/
- All files in src/lib/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 NEW DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the ENTIRE contents of src/index.css with this:

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 20% 98%;
    --foreground: 215 25% 12%;

    --card: 0 0% 100%;
    --card-foreground: 215 25% 12%;

    --popover: 0 0% 100%;
    --popover-foreground: 215 25% 12%;

    --primary: 168 85% 28%;
    --primary-foreground: 0 0% 100%;

    --secondary: 210 20% 94%;
    --secondary-foreground: 215 25% 12%;

    --muted: 210 15% 93%;
    --muted-foreground: 215 12% 48%;

    --accent: 168 75% 42%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --success: 168 85% 28%;
    --success-foreground: 0 0% 100%;

    --border: 210 15% 88%;
    --input: 210 15% 88%;
    --ring: 168 85% 28%;

    --radius: 0.625rem;

    --sidebar-background: 215 35% 10%;
    --sidebar-foreground: 210 20% 88%;
    --sidebar-primary: 168 85% 38%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 215 30% 16%;
    --sidebar-accent-foreground: 210 20% 88%;
    --sidebar-border: 215 28% 16%;
    --sidebar-ring: 168 85% 38%;

    --font-display: 'Instrument Serif', serif;
    --font-body: 'Plus Jakarta Sans', sans-serif;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; font-family: 'Plus Jakarta Sans', sans-serif; }
  h1, h2, h3 { font-family: 'Instrument Serif', serif; }
}
```

Replace tailwind.config.ts fontFamily section:
```
fontFamily: {
  display: ["'Instrument Serif'", "serif"],
  body: ["'Plus Jakarta Sans'", "sans-serif"],
},
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ LOGO — Replace src/components/AssignifyLogo.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a new SVG-based logo. The icon is a stylized mortar board (graduation cap) combined with a checkmark, in the primary green color. The wordmark uses Instrument Serif italic for "Assignify".

```tsx
import React from "react";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

const AssignifyLogo = ({ size = "md", variant = "dark", showText = true }: Props) => {
  const iconSize = size === "sm" ? 32 : size === "md" ? 40 : 52;
  const textClass = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-3xl";
  const color = variant === "light" ? "#ffffff" : "#0f7a5a";
  const textColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className="flex items-center gap-2.5">
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill={variant === "light" ? "rgba(255,255,255,0.15)" : "#e6f5f0"} />
        <path d="M24 10L8 18L24 26L40 18L24 10Z" fill={color} opacity="0.9"/>
        <path d="M14 22V32C14 32 18 37 24 37C30 37 34 32 34 32V22L24 27L14 22Z" fill={color}/>
        <path d="M38 18V28" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="38" cy="29.5" r="2" fill={color}/>
        <path d="M19 31.5L22.5 34.5L29 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showText && (
        <span className={`font-display italic font-normal ${textClass} ${textColor} tracking-tight`}>
          Assignify
        </span>
      )}
    </div>
  );
};

export default AssignifyLogo;
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 SIDEBAR — Replace src/components/SidebarLayout.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dark sidebar (#0f1f1a approx), clean and minimal. Shows:
- Logo at top
- Welcome message: "Good [morning/afternoon/evening], [first name]" — get name from JWT token stored in localStorage "ap_token" (decode the payload to get user_metadata.full_name)
- Nav items: Dashboard (grid icon), Create Assignment (plus icon)
- At bottom: Help link, Logout button

```tsx
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut, GraduationCap, HelpCircle } from "lucide-react";
import AssignifyLogo from "./AssignifyLogo";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getUserName(): string {
  try {
    const token = localStorage.getItem("ap_token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    const full = payload?.user_metadata?.full_name || payload?.email || "";
    return full.split(" ")[0];
  } catch { return ""; }
}

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const name = getUserName();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/assignments/new", icon: PlusCircle, label: "Create Assignment" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("ap_token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0a1a14] text-white shrink-0 fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <AssignifyLogo size="sm" variant="light" />
        </div>

        {/* Greeting */}
        {name && (
          <div className="px-5 pt-5 pb-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Lecturer Portal</p>
            <p className="text-white/90 text-sm mt-1 font-medium">{getGreeting()}, <span className="text-[#4ade80]">{name}</span></p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#0f7a5a] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <a
            href="mailto:support@assignify.app"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <HelpCircle className="h-4 w-4" />
            Help & Support
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#0a1a14] px-4 py-3 flex items-center justify-between">
        <AssignifyLogo size="sm" variant="light" />
        <button onClick={handleLogout} className="text-white/60 hover:text-white">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DASHBOARD — Replace src/pages/Dashboard.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep ALL existing API logic exactly. Only change the visual design.

Design: Clean white cards, green accents, professional academic feel.
- Page header: "My Assignments" in Instrument Serif
- Stats row: 3 cards with subtle green left border accent
- Assignment cards: Clean bordered cards, course name in green caps, title in serif, deadline formatted nicely, status badge (green "Open" / red "Closed")
- Buttons: outlined style, compact
- Empty state: Illustration-like empty state with graduation cap icon

IMPORTANT NEW FEATURE — Copy Link button must actually work:
```tsx
const copyLink = (id: string) => {
  const url = `${window.location.origin}/submit/${id}`;
  navigator.clipboard.writeText(url).then(() => {
    toast.success("Submission link copied to clipboard!");
  }).catch(() => {
    // Fallback for non-secure contexts
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toast.success("Submission link copied!");
  });
};
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CREATE ASSIGNMENT — Replace src/pages/CreateAssignment.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep ALL existing API logic. Add these NEW fields:

1. Assignment Instructions (optional textarea) — rich multiline text
   - Label: "Assignment Instructions (optional)"  
   - Placeholder: "Describe the assignment, requirements, marking scheme..."
   - Add to formData: formData.append("instructions", form.instructions)

2. Close Assignment toggle — "Allow manual close" switch
   - If enabled, lecturer can close assignment before deadline from detail page

Form layout: Single column, card-wrapped, clean labels, green focus states.

Send to API: POST /assignments with all existing fields PLUS:
- instructions: string (optional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ASSIGNMENT DETAIL — Replace src/pages/AssignmentDetail.tsx  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep ALL existing API logic. Add these improvements:

NEW FEATURE 1 — Manual close button:
Add a "Close Assignment" button in the header actions area.
When clicked: PATCH /assignments/:id/close (sends { is_closed: true })
Show confirmation dialog before closing.
Once closed, show red "Closed by lecturer" badge instead of deadline badge.

NEW FEATURE 2 — View Instructions panel:
If assignment has instructions, show an "Assignment Brief" collapsible section at the top.
When expanded, shows the instructions in a clean paper-like card with serif font.
Should feel like "unfolding a paper" — use smooth CSS transition height animation.

NEW FEATURE 3 — File URL proxying display:
In the File column of submissions table, show "View File" button that opens the file URL.
Do NOT show the raw Supabase URL anywhere visible. Just show "View File" as a button.

Design improvements:
- Header section: Course in green caps, title in large serif, deadline + status
- Action buttons: Clean outlined buttons in a flex-wrap row
- Filters: Inline filter bar with subtle background
- Table: Clean with alternating row colors, late submissions have red left border
- Score inputs: Compact, centered, save on blur

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 STUDENT SUBMISSION — Replace src/pages/StudentSubmission.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep ALL existing API logic. Redesign completely.

NEW FEATURE — Assignment Brief button:
If assignment has instructions field (from GET /assignments/:id), show a button "View Assignment Brief" near the top.
When clicked, the brief expands INLINE on the same page — like unfolding a paper.
Use smooth max-height transition animation. Show a paper/document icon.
The expanded brief should look like a clean paper card with the instructions text in a readable serif font.
A "Close Brief" button collapses it back.

Design:
- Header: Dark green (#0a1a14) with white text, logo, course + title
- Countdown timer: Large monospace font in green color
- If deadline passed: Full-width red alert banner, form disabled
- If closed by lecturer: Show "This assignment has been closed by your lecturer"
- Form: Clean white card, generous spacing, green focus rings
- File upload: Dashed border zone, drag and drop, show file name + size after selection
- Submit button: Full width, dark green, white text
- Success screen: Centered, large green checkmark SVG animation, clean typography

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 FORGOT PASSWORD — Replace src/pages/ForgotPassword.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep existing API logic (POST /auth/forgot-password).
Design: Centered card on dark green background (#0a1a14).
Show logo at top, clean form, success state.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 BACKEND API ADDITIONS NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The backend needs two new endpoints. Add frontend calls for:

1. PATCH /assignments/:id/close
   Request body (FormData): { is_closed: true }
   Used by: AssignmentDetail close button

2. GET /assignments/:id returns these additional fields:
   - instructions (string or null)
   - is_closed (boolean)

These will be added to the backend separately. For now, handle gracefully if missing (instructions = null means no brief to show, is_closed = false means open).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 GENERAL RULES FOR ALL PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Color palette:
   - Primary green: #0f7a5a (dark teal-green)
   - Light green: #4ade80 (for accents on dark backgrounds)
   - Sidebar bg: #0a1a14
   - Page bg: #f8faf9
   - Card bg: #ffffff
   - Text: #111827
   - Muted text: #6b7280
   - Border: #e5e7eb
   - Success: #0f7a5a
   - Danger: #dc2626

2. Typography:
   - Headings: Instrument Serif (serif, elegant)
   - Body: Plus Jakarta Sans (clean, modern)
   - Code/matric numbers: font-mono

3. Never show raw Supabase URLs to users — always hide behind buttons

4. All buttons should have clear hover states with 150ms transition

5. Toast notifications: use existing sonner setup

6. Loading states: use existing LoadingSpinner component

7. The app name is "Assignify" — keep this everywhere

8. DO NOT change: Login.tsx, Register.tsx, axios.ts, config.ts, App.tsx, main.tsx, all ui/ components


