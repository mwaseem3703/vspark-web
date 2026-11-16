-- VSPARK 2026 PostgreSQL Database Schema for Supabase
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.submission_mode AS ENUM ('scheduled', 'open', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 1 AND 100),
  email TEXT UNIQUE NOT NULL,
  phone_no TEXT NOT NULL,
  university_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  status public.account_status NOT NULL DEFAULT 'pending',
  payment_receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Competition Settings Table
CREATE TABLE IF NOT EXISTS public.competition_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK(id = 1),
  title TEXT NOT NULL DEFAULT 'VSPARK 2026 Web Development Challenge',
  task_description TEXT NOT NULL DEFAULT 'VSpark Web Development Task Brief

<!-- VSPARK_CONFIG_START -->
{
  "accountTitle": "COMSATS Web Society",
  "accountNumber": "0123 4567 8901 23",
  "bankName": "Easypaisa / HBL",
  "feeAmount": "Rs. 500",
  "allowedTechStack": "Next.js 15/16, React 19, Tailwind CSS, TypeScript / JavaScript, Supabase / PostgreSQL, Node.js, Vercel",
  "competitionGuidelines": "1. Build full-stack responsive web app.\n2. Submit public GitHub repository.\n3. Upload clean project folder to Google Drive without node_modules.\n4. Complete within 120-minute countdown.\n5. Live code defense with judges.",
  "gradingCriteria": "UI/UX & Responsiveness (10 Marks)\nAuthentication & Protected Routes (15 Marks)\nDatabase & Full CRUD (20 Marks)\nCloud Storage File Uploads (10 Marks)\nExternal API Integration (15 Marks)\nLive Public Deployment (15 Marks)\nCode Quality & Structure (5 Marks)\nDocumentation & README (5 Marks)\nLive Demo & Code Defense (5 Marks)",
  "checklist": [
    "Public GitHub repository URL provided",
    "Source code folder uploaded to Google Drive without node_modules",
    "Responsive design verified on mobile & desktop",
    "Authentication & Database CRUD working",
    "README with project summary & screenshots included"
  ],
  "approvals": {},
  "unlockedSubmissions": {},
  "allowAllResubmissions": false
}
<!-- VSPARK_CONFIG_END -->',
  task_pdf_url TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  end_time TIMESTAMPTZ NOT NULL DEFAULT now() + interval '120 minutes',
  submission_mode public.submission_mode NOT NULL DEFAULT 'open',
  results_published BOOLEAN NOT NULL DEFAULT false,
  event_location TEXT NOT NULL DEFAULT 'COMSATS University Islamabad, Vehari Campus',
  prizes JSONB NOT NULL DEFAULT '["1st Place: Trophy + Certificate", "2nd Place: Trophy + Certificate", "3rd Place: Trophy + Certificate"]',
  bank_name TEXT NOT NULL DEFAULT 'Easypaisa / HBL',
  bank_title TEXT NOT NULL DEFAULT 'COMSATS Web Society',
  bank_account TEXT NOT NULL DEFAULT '0123 4567 8901 23',
  bank_iban TEXT NOT NULL DEFAULT 'PK00HBLB01234567890123',
  google_drive_folder_url TEXT NOT NULL DEFAULT 'https://drive.google.com/drive/folders/1zHVG2Ja-CqUQaBJ5MCB_FhBrKTZ2nKm-',
  google_drive_script_url TEXT DEFAULT '',
  announcement TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.competition_settings (id)
VALUES (1)
ON CONFLICT (id) DO UPDATE SET
  google_drive_folder_url = EXCLUDED.google_drive_folder_url;

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  student_name TEXT,
  github_url TEXT NOT NULL,
  drive_folder_url TEXT NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 0 CHECK(total_marks BETWEEN 0 AND 100),
  graded BOOLEAN NOT NULL DEFAULT false,
  admin_feedback TEXT NOT NULL DEFAULT '',
  unlocked BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Evaluations Table (10-Point Jury Rubric)
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_score NUMERIC(5,2) DEFAULT 0,
  feedback TEXT DEFAULT '',
  evaluator_name TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS submissions_score_idx ON public.submissions(total_marks DESC);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);

-- Grants
GRANT ALL ON public.profiles, public.competition_settings, public.submissions, public.evaluations TO service_role, postgres;
GRANT SELECT ON public.profiles, public.competition_settings, public.submissions, public.evaluations TO anon, authenticated;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT exists(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='admin');
$$;

-- Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_signup() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, email, phone_no, university_name, role, status)
  VALUES (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Participant'), 100),
    new.email,
    left(coalesce(new.raw_user_meta_data->>'phone_no', ''), 30),
    left(coalesce(new.raw_user_meta_data->>'university_name', 'COMSATS'), 150),
    'student',
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_no = EXCLUDED.phone_no,
    university_name = EXCLUDED.university_name;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_signup();

-- Published Leaderboard RPC
CREATE OR REPLACE FUNCTION public.published_leaderboard()
RETURNS TABLE(
  id uuid,
  full_name text,
  university_name text,
  total_marks integer,
  feedback text,
  participation_type text,
  team_name text,
  teammate_name text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT 
    s.id, 
    p.full_name, 
    p.university_name, 
    s.total_marks, 
    s.admin_feedback,
    COALESCE(p.participation_type, 'individual'),
    COALESCE(p.team_name, ''),
    COALESCE(p.teammate_name, '')
  FROM public.submissions s
  JOIN public.profiles p ON p.id = s.profile_id
  WHERE s.graded AND exists(SELECT 1 FROM public.competition_settings WHERE id = 1 AND results_published)
  ORDER BY s.total_marks DESC, p.full_name ASC;
$$;
