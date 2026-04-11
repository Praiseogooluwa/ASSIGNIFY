-- ═══════════════════════════════════════════════════════════════════
-- Assignify — Supabase SQL Schema
-- Run ALL of this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";


-- ─── Assignments ─────────────────────────────────────────────────────────────
-- Field names match exactly what the frontend sends and reads:
-- course_name, title, submission_type, deadline, number_of_groups, lecturer_id

create table if not exists assignments (
  id               uuid primary key default uuid_generate_v4(),
  lecturer_id      uuid references auth.users(id) on delete cascade,
  course_name      text not null,
  title            text not null,
  submission_type  text not null check (submission_type in ('individual', 'group')),
  deadline         timestamptz not null,
  number_of_groups int,
  target_level     text,          -- optional: "100L", "200L", "300L", "400L", "500L"
  created_at       timestamptz default now()
);


-- ─── Submissions ─────────────────────────────────────────────────────────────
-- Field names match what AssignmentDetail.tsx and StudentSubmission.tsx read:
-- full_name, matric_number, department, group_number, submitted_at, is_late, score, file_url

create table if not exists submissions (
  id                uuid primary key default uuid_generate_v4(),
  assignment_id     uuid references assignments(id) on delete cascade,
  full_name         text not null,
  matric_number     text not null,
  department        text not null,
  group_number      int,
  file_url          text,
  storage_path      text,
  original_filename text,
  renamed_filename  text,
  is_late           boolean default false,
  score             numeric(5,2),
  submitted_at      timestamptz default now()
);

-- Prevent duplicate matric per assignment
create unique index if not exists unique_matric_per_assignment
  on submissions(assignment_id, matric_number);


-- ─── Row Level Security ───────────────────────────────────────────────────────

-- Assignments table
alter table assignments enable row level security;

-- Anyone can read assignments (students need to load assignment details via /submit/:id)
create policy "Public can read assignments"
  on assignments for select using (true);

-- Only authenticated lecturers can create/update/delete
create policy "Lecturers can insert assignments"
  on assignments for insert
  with check (auth.uid() = lecturer_id);

create policy "Lecturers can update their assignments"
  on assignments for update
  using (auth.uid() = lecturer_id);

create policy "Lecturers can delete their assignments"
  on assignments for delete
  using (auth.uid() = lecturer_id);

-- Service role bypasses all RLS (used by FastAPI with service key)
create policy "Service role full access assignments"
  on assignments for all
  using (auth.role() = 'service_role');


-- Submissions table
alter table submissions enable row level security;

-- Students can insert (public submission)
create policy "Anyone can submit"
  on submissions for insert
  with check (true);

-- Service role reads/updates (lecturer dashboard via FastAPI)
create policy "Service role full access submissions"
  on submissions for all
  using (auth.role() = 'service_role');


-- ─── Storage Bucket ──────────────────────────────────────────────────────────
-- Create this in Supabase Dashboard → Storage → New Bucket
-- OR run the SQL below:

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

-- Allow anyone to upload files (students submit)
create policy "Anyone can upload submissions"
  on storage.objects for insert
  with check (bucket_id = 'submissions');

-- Public read (file URLs must be accessible directly)
create policy "Public can read submission files"
  on storage.objects for select
  using (bucket_id = 'submissions');

-- Service role can delete files
create policy "Service role can delete submission files"
  on storage.objects for delete
  using (bucket_id = 'submissions' and auth.role() = 'service_role');