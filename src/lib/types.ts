export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone_no: string;
  university_name: string;
  role: "student" | "admin";
  status: "pending" | "approved" | "rejected";
  payment_receipt_url?: string | null;
  created_at: string;
  participation_type?: "individual" | "team";
  team_name?: string | null;
  team_role?: "leader" | "member" | "individual";
  team_id?: string | null;
  department?: string | null;
  semester?: string | null;
  teammate_name?: string | null;
  teammate_email?: string | null;
  teammate_phone?: string | null;
  teammate_department?: string | null;
  teammate_semester?: string | null;
};

export type Settings = {
  id: number;
  title: string;
  task_description: string;
  task_pdf_url: string | null;
  start_time: string;
  duration_minutes?: number;
  end_time: string;
  submission_mode: "scheduled" | "open" | "closed";
  results_published: boolean;
  event_location: string;
  prizes: string[];
  bank_name: string;
  bank_title: string;
  bank_account: string;
  bank_iban: string;
  fee_amount?: string;
  allowed_tech_stack?: string;
  competition_guidelines?: string;
  grading_criteria?: string;
  checklist?: string[];
  google_drive_folder_url?: string;
  google_drive_script_url?: string;
  google_drive_verified_at?: string | null;
  announcement?: string;
  unlocked_submissions?: Record<string, boolean>;
};

export type RubricCriterion = {
  id: string;
  label: string;
  max: number;
  description: string;
};

export const OFFICIAL_RUBRIC: RubricCriterion[] = [
  { id: "ui_ux", label: "UI/UX & Responsiveness", max: 10, description: "Modern UI, mobile-responsive, clean layout, intuitive design." },
  { id: "auth", label: "Authentication & Protected Routes", max: 15, description: "Role-based access, gatekeeper guards, secure login/signup." },
  { id: "crud", label: "Database & Full CRUD Operations", max: 20, description: "Relational data design, Create/Read/Update/Delete working." },
  { id: "storage", label: "Cloud Storage File Uploads", max: 10, description: "Secure uploads, clean file handling, Drive/bucket storage." },
  { id: "api", label: "External API Integration", max: 15, description: "Third-party APIs, SMTP email notifications, robust handlers." },
  { id: "deployment", label: "Live Public Deployment", max: 15, description: "Production build deployed, zero build errors, public URL." },
  { id: "code_quality", label: "Code Quality & Structure", max: 5, description: "Clean code structure, modular components, TypeScript types." },
  { id: "docs", label: "Documentation & README", max: 5, description: "Comprehensive README with screenshots and setup guide." },
  { id: "defense", label: "Live Demo & Code Defense", max: 5, description: "Ability to explain architecture, solve questions with jury." }
];

export type Evaluation = {
  id?: string;
  submission_id: string;
  student_id: string;
  scores: Record<string, number>;
  total_score: number;
  feedback: string;
  evaluator_name?: string;
  is_published?: boolean;
};

export type Submission = {
  id: string;
  profile_id: string;
  student_email?: string;
  student_name?: string;
  university_name?: string;
  github_url: string;
  drive_folder_url: string;
  storage_archive_url?: string;
  total_marks: number;
  admin_feedback: string;
  submitted_at: string;
  graded?: boolean;
  unlocked?: boolean;
  evaluation?: Evaluation;
};

export type LeaderEntry = {
  id: string;
  full_name: string;
  university_name: string;
  total_marks: number;
  feedback?: string;
  scores?: Record<string, number>;
  participation_type?: "individual" | "team";
  team_name?: string;
  teammate_name?: string;
  team_role?: "leader" | "member";
};

export type AppData = {
  services?: {
    email: boolean;
    drive: boolean;
    drive_credentials?: boolean;
    drive_account_email?: string;
    drive_mode?: "personal" | "shared" | null;
    drive_oauth_available?: boolean;
  };
  settings: Settings;
  profile: Profile | null;
  students: Profile[];
  submissions: Submission[];
  leaderboard: LeaderEntry[];
  evaluations?: Record<string, Evaluation>;
};
