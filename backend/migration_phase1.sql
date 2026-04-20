-- ═══════════════════════════════════════════════════════════════════
-- Assignify — Phase 1 Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Academic Sessions ─────────────────────────────────────────────────────
create table if not exists academic_sessions (
  id           uuid primary key default uuid_generate_v4(),
  lecturer_id  uuid references auth.users(id) on delete cascade,
  title        text not null,          -- e.g. "2025/2026"
  is_current   boolean default false,
  created_at   timestamptz default now()
);

alter table academic_sessions enable row level security;
create policy "Service role full access academic_sessions"
  on academic_sessions for all using (auth.role() = 'service_role');


-- ─── 2. Semesters ─────────────────────────────────────────────────────────────
create table if not exists semesters (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid references academic_sessions(id) on delete cascade,
  lecturer_id  uuid references auth.users(id) on delete cascade,
  name         text not null check (name in ('First', 'Second')),
  is_active    boolean default false,
  created_at   timestamptz default now(),
  unique(session_id, name)
);

alter table semesters enable row level security;
create policy "Service role full access semesters"
  on semesters for all using (auth.role() = 'service_role');


-- ─── 3. Courses ───────────────────────────────────────────────────────────────
create table if not exists courses (
  id           uuid primary key default uuid_generate_v4(),
  semester_id  uuid references semesters(id) on delete cascade,
  lecturer_id  uuid references auth.users(id) on delete cascade,
  course_code  text not null,           -- e.g. "MAT102"
  course_name  text not null,           -- e.g. "Mathematics II"
  target_level text,                    -- e.g. "100L"
  created_at   timestamptz default now()
);

alter table courses enable row level security;
create policy "Service role full access courses"
  on courses for all using (auth.role() = 'service_role');


-- ─── 4. Add course_id to assignments (nullable — existing rows stay valid) ────
alter table assignments
  add column if not exists course_id uuid references courses(id) on delete set null;


-- ─── 5. Indexes for fast lookups ──────────────────────────────────────────────
create index if not exists idx_sessions_lecturer   on academic_sessions(lecturer_id);
create index if not exists idx_semesters_session   on semesters(session_id);
create index if not exists idx_courses_semester    on courses(semester_id);
create index if not exists idx_assignments_course  on assignments(course_id);