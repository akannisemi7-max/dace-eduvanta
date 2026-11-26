-- =====================================================================
-- EduVanta cloud schema v2 for D-Ace Ultimate Secondary School (Supabase)
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste ALL of this > Run.
-- THEN run the one-line setup-code step described in SETUP.md (step 1b).
--
-- SAFETY
--  * Never drops or truncates a table, and this script itself never deletes any rows.
--  * Only drops and recreates policies and triggers that THIS file creates (listed by name).
--  * Grants and revokes touch only EduVanta's own tables and functions.
--  * Seed data uses "on conflict do nothing", so re-running keeps your existing school data.
--  * Wrapped in one transaction: if anything fails, nothing is changed.
-- =====================================================================

begin;

-- ---------- 1. Tables ----------
create table if not exists public.schools (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id text not null default 'dace',
  role text not null check (role in ('proprietor','admin','teacher','student')),
  status text not null default 'pending' check (status in ('pending','active')),
  active boolean not null default false,
  class_id text,
  email text,
  name text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

do $$
declare t record;
begin
  for t in select * from (values
    ('classes',''),
    ('subjects',''),
    ('sessions',''),
    ('announcements',''),
    ('attendance_audit',''),
    ('activity_log',''),
    ('slots','teacher_id text, class_id text,'),
    ('attendance','user_id text, day text,'),
    ('lessons','teacher_id text, day text,'),
    ('lesson_notes','teacher_id text, status text,'),
    ('notifications','to_user text,'),
    ('note_folders','teacher_id text,'),
    ('assessments','teacher_id text, class_id text, status text,'),
    ('assessment_keys',''),
    ('attempts','student_id text, assessment_id text, status text,'),
    ('marks','student_id text, class_id text, subject_id text, session_id text, term text,'),
    ('sheets','class_id text, subject_id text, session_id text, term text, status text, teacher_id text,'),
    ('comments','student_id text,'),
    ('termresults','student_id text,')
  ) as v(tname, tcols)
  loop
    execute format(
      'create table if not exists public.%I (id text primary key, school_id text not null default ''dace'', %s data jsonb not null, updated_at timestamptz not null default now())',
      t.tname, t.tcols);
  end loop;
end $$;

-- Columns on attempts that only the server may set (the app can read them but never write them).
alter table public.attempts add column if not exists score numeric;
alter table public.attempts add column if not exists total numeric;
alter table public.attempts add column if not exists submitted_at timestamptz;
alter table public.attempts add column if not exists started_at timestamptz not null default now();
alter table public.attempts add column if not exists late boolean not null default false;
alter table public.attempts add column if not exists voided boolean not null default false;

-- One-time setup record for claiming the owner account. Clients can never read or write it.
create table if not exists public.app_setup (
  id int primary key default 1 check (id = 1),
  code_hash text,
  claimed boolean not null default false
);
insert into public.app_setup (id) values (1) on conflict (id) do nothing;

create index if not exists slots_teacher_idx        on public.slots (teacher_id);
create index if not exists attendance_user_idx      on public.attendance (user_id, day);
create index if not exists lessons_teacher_idx      on public.lessons (teacher_id, day);
create index if not exists notes_teacher_idx        on public.lesson_notes (teacher_id);
create index if not exists notifications_to_idx     on public.notifications (to_user);
create index if not exists attempts_student_idx     on public.attempts (student_id);
create index if not exists attempts_assessment_idx  on public.attempts (assessment_id);
create index if not exists marks_student_idx        on public.marks (student_id);
create index if not exists marks_class_subject_idx  on public.marks (class_id, subject_id);
create index if not exists sheets_class_subject_idx on public.sheets (class_id, subject_id);
create index if not exists assessments_class_idx    on public.assessments (class_id);
-- A student can only ever have ONE live attempt per assessment (a teacher "retake" voids the old one).
create unique index if not exists attempts_one_live on public.attempts (assessment_id, student_id) where not voided;

-- ---------- 2. Helper functions (security definer so policies never recurse) ----------
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and status = 'active' and active
$$;
create or replace function public.my_school() returns text
language sql stable security definer set search_path = public as $$
  select school_id from public.profiles where id = auth.uid() and status = 'active' and active
$$;
create or replace function public.my_class() returns text
language sql stable security definer set search_path = public as $$
  select class_id from public.profiles where id = auth.uid() and status = 'active' and active
$$;
create or replace function public.is_mgmt() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() in ('admin','proprietor'), false)
$$;
create or replace function public.owner_exists() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where role = 'proprietor')
$$;
create or replace function public.teaches(c text, s text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher' and p.status = 'active' and p.active
      and p.data->'assign' @> jsonb_build_array(jsonb_build_object('classId', c, 'subjectId', s)))
$$;
create or replace function public.teaches_class(c text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p, jsonb_array_elements(coalesce(p.data->'assign', '[]'::jsonb)) as a(elem)
    where p.id = auth.uid() and p.role = 'teacher' and p.status = 'active' and p.active
      and a.elem->>'classId' = c)
$$;
create or replace function public.owns_assessment(aid text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.assessments a where a.id = aid and a.teacher_id = auth.uid()::text)
$$;
create or replace function public.can_take(aid text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.assessments a
                 where a.id = aid and a.class_id = public.my_class() and a.status = 'published')
$$;
create or replace function public.sheet_published(c text, s text, ses text, tm text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sheets h
                 where h.class_id = c and h.subject_id = s and h.session_id = ses and h.term = tm and h.status = 'published')
$$;
create or replace function public.sheet_open(c text, s text, ses text, tm text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.sheets h
                     where h.class_id = c and h.subject_id = s and h.session_id = ses and h.term = tm and h.status <> 'draft')
$$;

-- What the sign-in page may show before anyone is signed in.
create or replace function public.public_info() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'name',  coalesce((select data->>'name' from public.schools where id = 'dace'), 'School'),
    'logo',  (select data->'settings'->>'logo' from public.schools where id = 'dace'),
    'owner', public.owner_exists())
$$;

-- Run once from the SQL editor to choose the secret setup code. Not callable from the app.
create or replace function public.set_setup_code(code text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if code is null or length(code) < 12 then raise exception 'Use a setup code of at least 12 characters.'; end if;
  if (select claimed from public.app_setup where id = 1) then raise exception 'The owner account has already been created.'; end if;
  update public.app_setup set code_hash = encode(sha256(convert_to(code, 'UTF8')), 'hex') where id = 1;
  return 'Setup code saved. Keep it private. It works once.';
end $$;

-- The ONLY way to become owner: signed in + correct setup code + no owner yet.
create or replace function public.claim_owner(setup_code text, p_name text, p_phone text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); em text; st public.app_setup%rowtype;
begin
  if uid is null then raise exception 'Please sign in first.'; end if;
  select * into st from public.app_setup where id = 1 for update;
  if not found or st.code_hash is null then raise exception 'Setup is not ready: the setup code has not been created yet.'; end if;
  if st.claimed or exists (select 1 from public.profiles where role = 'proprietor') then raise exception 'This school already has an owner.'; end if;
  if encode(sha256(convert_to(coalesce(setup_code, ''), 'UTF8')), 'hex') <> st.code_hash then raise exception 'That setup code is not right.'; end if;
  delete from public.profiles where id = uid and role = 'teacher' and status = 'pending';
  select email into em from auth.users where id = uid;
  insert into public.profiles (id, school_id, role, status, active, email, name, data)
  values (uid, 'dace', 'proprietor', 'active', true, em, p_name,
    jsonb_build_object('id', uid::text, 'school', 'dace', 'role', 'proprietor', 'name', p_name, 'email', em,
      'staffId', 'OWN-001', 'phone', coalesce(p_phone, ''), 'active', true, 'status', 'active', 'assign', '[]'::jsonb));
  update public.app_setup set claimed = true where id = 1;
  return jsonb_build_object('ok', true);
end $$;

-- Marks an exam on the server. The student's browser never sees the answer key and cannot set a score.
create or replace function public.submit_attempt(attempt_id text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a public.attempts%rowtype; s public.assessments%rowtype; k public.assessment_keys%rowtype;
  q jsonb; sc numeric := 0; tot numeric := 0; ans jsonb; keys jsonb; mk numeric; dur int; is_late boolean; review jsonb := '{}'::jsonb;
begin
  select * into a from public.attempts where id = attempt_id for update;
  if not found or a.student_id is distinct from auth.uid()::text then raise exception 'Attempt not found.'; end if;
  if public.my_role() is distinct from 'student' then raise exception 'Only students can submit an exam.'; end if;
  if a.voided then raise exception 'This attempt was cancelled by your teacher.'; end if;
  if a.status = 'submitted' then return jsonb_build_object('score', a.score, 'total', a.total, 'late', a.late); end if;
  select * into s from public.assessments where id = a.assessment_id;
  if not found or s.class_id is distinct from public.my_class() then raise exception 'Assessment not found.'; end if;
  select * into k from public.assessment_keys where id = a.assessment_id;
  keys := coalesce(k.data->'answers', '{}'::jsonb);
  ans  := coalesce(a.data->'answers', '{}'::jsonb);
  for q in select value from jsonb_array_elements(coalesce(s.data->'questions', '[]'::jsonb)) loop
    mk := coalesce(nullif(q->>'marks', '')::numeric, 1);
    tot := tot + mk;
    if (keys->>(q->>'id')) is not null and (ans->>(q->>'id')) is not distinct from (keys->>(q->>'id')) then
      sc := sc + mk;
    end if;
  end loop;
  dur := coalesce(nullif(s.data->>'duration', '')::int, 0);
  is_late := dur > 0 and now() > a.started_at + make_interval(mins => dur) + interval '2 minutes';
  if s.data->>'showResult' = 'review' then review := keys; end if;
  update public.attempts
     set status = 'submitted', score = sc, total = tot, submitted_at = now(), late = is_late,
         data = a.data || jsonb_build_object('review', review)
   where id = attempt_id;
  return jsonb_build_object('score', sc, 'total', tot, 'late', is_late);
end $$;

-- ---------- 3. Triggers ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['schools','profiles','classes','subjects','sessions','announcements','attendance_audit','activity_log',
      'slots','attendance','lessons','lesson_notes','notifications','note_folders','assessments','assessment_keys','attempts','marks','sheets','comments','termresults']
  loop
    execute format('drop trigger if exists eduvanta_touch on public.%I', t);
    execute format('create trigger eduvanta_touch before insert or update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Stops people changing their own role, approval or class, and stops anyone but the owner changing roles.
create or replace function public.profiles_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := public.my_role();
begin
  if auth.uid() is null then return new; end if;   -- server-side (Edge Function / SQL editor)
  if new.id <> old.id or new.school_id <> old.school_id then raise exception 'Not allowed'; end if;
  if old.role = 'proprietor' and r is distinct from 'proprietor' then raise exception 'Only the owner can change the owner'; end if;
  if new.role <> old.role and r is distinct from 'proprietor' then raise exception 'Only the owner can change roles'; end if;
  if r in ('admin','proprietor') then return new; end if;
  if auth.uid() = old.id then
    if new.status <> old.status or new.active <> old.active or new.role <> old.role
       or new.class_id is distinct from old.class_id
       or (new.data->'assign') is distinct from (old.data->'assign') then
      raise exception 'Not allowed';
    end if;
    return new;
  end if;
  if r = 'teacher' and old.role = 'student' then
    if new.role <> old.role or new.status <> old.status or new.class_id is distinct from old.class_id then
      raise exception 'Not allowed';
    end if;
    return new;
  end if;
  raise exception 'Not allowed';
end $$;
drop trigger if exists eduvanta_guard on public.profiles;
create trigger eduvanta_guard before update on public.profiles for each row execute function public.profiles_guard();

-- A new exam attempt always starts "in progress" with the server's clock and no score.
create or replace function public.attempts_init() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  new.started_at := now(); new.status := 'in_progress'; new.score := null; new.total := null;
  new.submitted_at := null; new.late := false; new.voided := false;
  return new;
end $$;
drop trigger if exists eduvanta_attempts_init on public.attempts;
create trigger eduvanta_attempts_init before insert on public.attempts for each row execute function public.attempts_init();

-- ---------- 4. Row Level Security ----------
do $$
declare t text;
begin
  foreach t in array array['schools','profiles','classes','subjects','sessions','announcements','attendance_audit','activity_log',
      'slots','attendance','lessons','lesson_notes','notifications','note_folders','assessments','assessment_keys','attempts','marks','sheets','comments','termresults','app_setup']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
-- app_setup deliberately has NO policies: nobody can read or write it through the app.

-- Remove ONLY the policies this file creates (by name), so re-running is safe and nothing else is touched.
drop policy if exists schools_select on public.schools;
drop policy if exists schools_update on public.schools;
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists classes_select on public.classes;
drop policy if exists classes_write on public.classes;
drop policy if exists subjects_select on public.subjects;
drop policy if exists subjects_write on public.subjects;
drop policy if exists sessions_select on public.sessions;
drop policy if exists sessions_write on public.sessions;
drop policy if exists slots_select on public.slots;
drop policy if exists slots_write on public.slots;
drop policy if exists attendance_select on public.attendance;
drop policy if exists attendance_insert on public.attendance;
drop policy if exists attendance_update on public.attendance;
drop policy if exists audit_select on public.attendance_audit;
drop policy if exists audit_insert on public.attendance_audit;
drop policy if exists lessons_select on public.lessons;
drop policy if exists lessons_insert on public.lessons;
drop policy if exists lessons_update on public.lessons;
drop policy if exists notes_select on public.lesson_notes;
drop policy if exists notes_insert on public.lesson_notes;
drop policy if exists notes_teacher_update on public.lesson_notes;
drop policy if exists notes_teacher_delete on public.lesson_notes;
drop policy if exists notes_mgmt_update on public.lesson_notes;
drop policy if exists folders_own on public.note_folders;
drop policy if exists notifications_select on public.notifications;
drop policy if exists notifications_insert on public.notifications;
drop policy if exists notifications_update on public.notifications;
drop policy if exists notifications_delete on public.notifications;
drop policy if exists announcements_select on public.announcements;
drop policy if exists announcements_insert on public.announcements;
drop policy if exists activity_insert on public.activity_log;
drop policy if exists activity_select on public.activity_log;
drop policy if exists assessments_select on public.assessments;
drop policy if exists assessments_teacher on public.assessments;
drop policy if exists assessments_mgmt on public.assessments;
drop policy if exists keys_teacher on public.assessment_keys;
drop policy if exists keys_mgmt on public.assessment_keys;
drop policy if exists attempts_select on public.attempts;
drop policy if exists attempts_student_insert on public.attempts;
drop policy if exists attempts_student_update on public.attempts;
drop policy if exists attempts_teacher_update on public.attempts;
drop policy if exists attempts_mgmt on public.attempts;
drop policy if exists marks_select on public.marks;
drop policy if exists marks_teacher on public.marks;
drop policy if exists marks_mgmt on public.marks;
drop policy if exists sheets_select on public.sheets;
drop policy if exists sheets_teacher_insert on public.sheets;
drop policy if exists sheets_teacher_update on public.sheets;
drop policy if exists sheets_mgmt on public.sheets;
drop policy if exists comments_select on public.comments;
drop policy if exists comments_mgmt on public.comments;
drop policy if exists termresults_select on public.termresults;
drop policy if exists termresults_mgmt on public.termresults;

-- schools
create policy schools_select on public.schools for select to authenticated using (id = public.my_school());
create policy schools_update on public.schools for update to authenticated
  using (id = public.my_school() and public.is_mgmt()) with check (id = public.my_school());

-- profiles: you see yourself; management sees everyone; teachers see only students of classes they teach.
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or (school_id = public.my_school() and (public.is_mgmt()
      or (public.my_role() = 'teacher' and role = 'student' and public.teaches_class(class_id)))));
-- Self sign-up creates a PENDING teacher account for yourself. Owner/admin roles can never be self-created.
create policy profiles_insert on public.profiles for insert to authenticated with check (
  id = auth.uid() and school_id = 'dace' and role = 'teacher' and status = 'pending' and not active);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()
      or (school_id = public.my_school() and (public.is_mgmt()
          or (public.my_role() = 'teacher' and role = 'student' and public.teaches_class(class_id)))))
  with check (school_id = 'dace');

-- reference data: everyone in the school reads; only management changes
create policy classes_select  on public.classes  for select to authenticated using (school_id = public.my_school());
create policy classes_write   on public.classes  for all    to authenticated using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());
create policy subjects_select on public.subjects for select to authenticated using (school_id = public.my_school());
create policy subjects_write  on public.subjects for all    to authenticated using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());
create policy sessions_select on public.sessions for select to authenticated using (school_id = public.my_school());
create policy sessions_write  on public.sessions for all    to authenticated using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

-- timetable
create policy slots_select on public.slots for select to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or teacher_id = auth.uid()::text));
create policy slots_write on public.slots for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

-- attendance: teachers see and write only their own; management sees and corrects all
create policy attendance_select on public.attendance for select to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or user_id = auth.uid()::text));
create policy attendance_insert on public.attendance for insert to authenticated
  with check (school_id = public.my_school() and (public.is_mgmt() or (user_id = auth.uid()::text and public.my_role() = 'teacher')));
create policy attendance_update on public.attendance for update to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or (user_id = auth.uid()::text and public.my_role() = 'teacher')))
  with check (school_id = public.my_school() and (public.is_mgmt() or user_id = auth.uid()::text));
create policy audit_select on public.attendance_audit for select to authenticated using (school_id = public.my_school() and public.is_mgmt());
create policy audit_insert on public.attendance_audit for insert to authenticated with check (school_id = public.my_school() and public.is_mgmt());

-- classroom activity
create policy lessons_select on public.lessons for select to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or teacher_id = auth.uid()::text));
create policy lessons_insert on public.lessons for insert to authenticated
  with check (school_id = public.my_school() and (public.is_mgmt() or (teacher_id = auth.uid()::text and public.my_role() = 'teacher')));
create policy lessons_update on public.lessons for update to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or (teacher_id = auth.uid()::text and public.my_role() = 'teacher')))
  with check (school_id = public.my_school() and (public.is_mgmt() or teacher_id = auth.uid()::text));

-- lesson notes: a teacher edits only their own drafts and sent-back notes and can never approve
create policy notes_select on public.lesson_notes for select to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or teacher_id = auth.uid()::text));
create policy notes_insert on public.lesson_notes for insert to authenticated
  with check (school_id = public.my_school() and public.my_role() = 'teacher' and teacher_id = auth.uid()::text and status in ('draft','submitted'));
create policy notes_teacher_update on public.lesson_notes for update to authenticated
  using (school_id = public.my_school() and public.my_role() = 'teacher' and teacher_id = auth.uid()::text and status in ('draft','rejected','corrections'))
  with check (school_id = public.my_school() and teacher_id = auth.uid()::text and status in ('draft','submitted','rejected','corrections'));
create policy notes_teacher_delete on public.lesson_notes for delete to authenticated
  using (school_id = public.my_school() and teacher_id = auth.uid()::text and status = 'draft');
create policy notes_mgmt_update on public.lesson_notes for update to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());
create policy folders_own on public.note_folders for all to authenticated
  using (school_id = public.my_school() and teacher_id = auth.uid()::text)
  with check (school_id = public.my_school() and teacher_id = auth.uid()::text);

-- notifications and announcements (students cannot send notifications)
create policy notifications_select on public.notifications for select to authenticated using (to_user = auth.uid()::text);
create policy notifications_insert on public.notifications for insert to authenticated
  with check (school_id = public.my_school() and public.my_role() in ('admin','proprietor','teacher'));
create policy notifications_update on public.notifications for update to authenticated using (to_user = auth.uid()::text) with check (to_user = auth.uid()::text);
create policy notifications_delete on public.notifications for delete to authenticated using (to_user = auth.uid()::text);
create policy announcements_select on public.announcements for select to authenticated using (school_id = public.my_school() and public.is_mgmt());
create policy announcements_insert on public.announcements for insert to authenticated with check (school_id = public.my_school() and public.is_mgmt());
create policy activity_insert on public.activity_log for insert to authenticated with check (school_id = public.my_school());
create policy activity_select on public.activity_log for select to authenticated using (school_id = public.my_school() and public.is_mgmt());

-- assessments: students see only PUBLISHED ones for their class, and never the answer key (it lives in assessment_keys)
create policy assessments_select on public.assessments for select to authenticated using (
  school_id = public.my_school() and (public.is_mgmt() or teacher_id = auth.uid()::text
    or (public.my_role() = 'student' and class_id = public.my_class() and status <> 'draft')));
create policy assessments_teacher on public.assessments for all to authenticated
  using (school_id = public.my_school() and public.my_role() = 'teacher' and teacher_id = auth.uid()::text)
  with check (school_id = public.my_school() and public.my_role() = 'teacher' and teacher_id = auth.uid()::text);
create policy assessments_mgmt on public.assessments for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());
-- answer keys: management and the owning teacher only. Students have no access at all.
create policy keys_teacher on public.assessment_keys for all to authenticated
  using (school_id = public.my_school() and public.my_role() = 'teacher' and public.owns_assessment(id))
  with check (school_id = public.my_school() and public.my_role() = 'teacher' and public.owns_assessment(id));
create policy keys_mgmt on public.assessment_keys for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

-- attempts: students create and edit only their own IN-PROGRESS attempt; submitting and scoring is done by submit_attempt()
create policy attempts_select on public.attempts for select to authenticated using (
  school_id = public.my_school() and (public.is_mgmt() or student_id = auth.uid()::text or public.owns_assessment(assessment_id)));
create policy attempts_student_insert on public.attempts for insert to authenticated with check (
  school_id = public.my_school() and public.my_role() = 'student' and student_id = auth.uid()::text
  and public.can_take(assessment_id) and status = 'in_progress' and score is null and total is null and not voided and not late);
create policy attempts_student_update on public.attempts for update to authenticated
  using (school_id = public.my_school() and public.my_role() = 'student' and student_id = auth.uid()::text and status = 'in_progress' and not voided)
  with check (school_id = public.my_school() and student_id = auth.uid()::text and status = 'in_progress'
              and score is null and total is null and submitted_at is null and not voided and not late);
create policy attempts_teacher_update on public.attempts for update to authenticated
  using (school_id = public.my_school() and public.owns_assessment(assessment_id)) with check (school_id = public.my_school());
create policy attempts_mgmt on public.attempts for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

-- results: teachers work only on classes and subjects assigned to them, and only until the sheet is submitted;
-- students see only their own published results
create policy marks_select on public.marks for select to authenticated using (
  school_id = public.my_school() and (public.is_mgmt()
    or (public.my_role() = 'teacher' and public.teaches(class_id, subject_id))
    or (public.my_role() = 'student' and student_id = auth.uid()::text and public.sheet_published(class_id, subject_id, session_id, term))));
create policy marks_teacher on public.marks for all to authenticated
  using (school_id = public.my_school() and public.my_role() = 'teacher' and public.teaches(class_id, subject_id)
         and public.sheet_open(class_id, subject_id, session_id, term))
  with check (school_id = public.my_school() and public.my_role() = 'teacher' and public.teaches(class_id, subject_id)
              and public.sheet_open(class_id, subject_id, session_id, term));
create policy marks_mgmt on public.marks for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

create policy sheets_select on public.sheets for select to authenticated using (
  school_id = public.my_school() and (public.is_mgmt()
    or (public.my_role() = 'teacher' and public.teaches(class_id, subject_id))
    or (public.my_role() = 'student' and class_id = public.my_class() and status = 'published')));
create policy sheets_teacher_insert on public.sheets for insert to authenticated
  with check (school_id = public.my_school() and public.my_role() = 'teacher' and public.teaches(class_id, subject_id) and status in ('draft','submitted'));
create policy sheets_teacher_update on public.sheets for update to authenticated
  using (school_id = public.my_school() and public.my_role() = 'teacher' and public.teaches(class_id, subject_id) and status = 'draft')
  with check (school_id = public.my_school() and status in ('draft','submitted'));
create policy sheets_mgmt on public.sheets for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

create policy comments_select on public.comments for select to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or student_id = auth.uid()::text));
create policy comments_mgmt on public.comments for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());
create policy termresults_select on public.termresults for select to authenticated
  using (school_id = public.my_school() and (public.is_mgmt() or student_id = auth.uid()::text));
create policy termresults_mgmt on public.termresults for all to authenticated
  using (school_id = public.my_school() and public.is_mgmt()) with check (school_id = public.my_school());

-- ---------- 5. Access (only EduVanta's own tables and functions) ----------
grant usage on schema public to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['schools','profiles','classes','subjects','sessions','announcements','attendance_audit','activity_log',
      'slots','attendance','lessons','lesson_notes','notifications','note_folders','assessments','assessment_keys','attempts','marks','sheets','comments','termresults']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
revoke all on public.app_setup from anon, authenticated;

revoke all on function public.my_role(), public.my_school(), public.my_class(), public.is_mgmt(), public.owner_exists(),
  public.teaches(text, text), public.teaches_class(text), public.owns_assessment(text), public.can_take(text),
  public.sheet_published(text, text, text, text), public.sheet_open(text, text, text, text),
  public.public_info(), public.set_setup_code(text), public.claim_owner(text, text, text), public.submit_attempt(text)
  from public, anon, authenticated;
grant execute on function public.my_role(), public.my_school(), public.my_class(), public.is_mgmt(), public.owner_exists(),
  public.teaches(text, text), public.teaches_class(text), public.owns_assessment(text), public.can_take(text),
  public.sheet_published(text, text, text, text), public.sheet_open(text, text, text, text),
  public.claim_owner(text, text, text), public.submit_attempt(text) to authenticated;
grant execute on function public.public_info() to anon, authenticated;
-- set_setup_code is intentionally not granted to anyone: only you, in the SQL editor, can run it.

-- ---------- 6. Starting data (kept if it already exists) ----------
insert into public.schools (id, data) values ('dace', jsonb_build_object(
  'id','dace','name','D-Ace Ultimate Secondary School','city','','code','DAUSS','created',to_char(now(),'YYYY-MM-DD'),
  'active',true,'plan','Free',
  'settings', jsonb_build_object('resume','08:00','close','15:00','grace',5,'geofence',false,'radius',150,'noteDay',4,'aiEnabled',true)))
on conflict (id) do nothing;

insert into public.classes (id, data)
select 'dace_c_' || t.n, jsonb_build_object('id','dace_c_' || t.n,'school','dace','name',t.n)
from unnest(array['JSS1','JSS2','JSS3','SS1','SS2','SS3']) as t(n)
on conflict (id) do nothing;

insert into public.subjects (id, data)
select 'dace_s_' || regexp_replace(lower(t.n), '[^a-z0-9]+', '', 'g'),
       jsonb_build_object('id','dace_s_' || regexp_replace(lower(t.n), '[^a-z0-9]+', '', 'g'),'school','dace','name',t.n)
from unnest(array['English Language','Mathematics','Civic Education','Basic Science','Physics','Chemistry','Biology','Economics','Government','Literature-in-English','Agricultural Science','Computer Studies']) as t(n)
on conflict (id) do nothing;

insert into public.sessions (id, data) values ('dace_ses_2627', jsonb_build_object(
  'id','dace_ses_2627','school','dace','name','2026/2027','current',true,'termIdx',0,
  'terms', jsonb_build_array(
    jsonb_build_object('name','First Term','start','2026-09-14','end','2026-12-18'),
    jsonb_build_object('name','Second Term','start','2027-01-11','end','2027-04-02'),
    jsonb_build_object('name','Third Term','start','2027-04-26','end','2027-07-16'))))
on conflict (id) do nothing;

commit;
