import type { AppData, Profile, Settings, Submission } from "./types";
export const demoStudent: Profile = {
  id: "demo-student",
  full_name: "Alex Morgan",
  email: "alex@example.com",
  phone_no: "923001234567",
  university_name: "COMSATS University Islamabad",
  role: "student",
  status: "approved",
  created_at: new Date().toISOString(),
};
export const defaultSettings: Settings = {
  id: 1,
  title: "Web Development Challenge",
  task_description:
    "Build Campus Connect: a responsive platform that helps students discover university clubs and events.\n\nYour application should include an event directory with search and filtering, event detail pages, a registration flow, and a dashboard for managing registrations.\n\nMake it accessible, thoughtful, and easy to use. Include a README with setup instructions, your technology choices, and any tradeoffs.\n\nEvaluation rubric\n• Functionality and completeness — 40 marks\n• UI, responsiveness, and accessibility — 30 marks\n• Code quality and structure — 20 marks\n• Creativity and attention to detail — 10 marks",
  task_pdf_url: null,
  start_time: new Date(Date.now() + 7 * 86400000).toISOString(),
  end_time: new Date(Date.now() + 7 * 86400000 + 3 * 3600000).toISOString(),
  submission_mode: "scheduled",
  results_published: false,
  event_location: "COMSATS University Islamabad · Vehari Campus",
  prizes: ["First place", "Second place", "Third place"],
  bank_name: "",
  bank_title: "",
  bank_account: "",
  bank_iban: "",
  google_drive_folder_url: "",
  google_drive_verified_at: null,
};
export function createDemo(): AppData {
  const names = [
    "Ayesha Khan",
    "Hamza Ahmed",
    "Fatima Ali",
    "Usman Malik",
    "Sara Hassan",
    "Bilal Shah",
  ];
  const students: Profile[] = names.map((name, i) => ({
    ...demoStudent,
    id: `student-${i}`,
    full_name: name,
    email: name.toLowerCase().replaceAll(" ", ".") + "@example.com",
    status: i < 3 ? "pending" : "approved",
    university_name: [
      "COMSATS University Islamabad",
      "University of Engineering & Technology",
      "Bahauddin Zakariya University",
    ][i % 3],
  }));
  const demoScores = [
    { ui_ux: 10, auth: 14, crud: 19, storage: 9, api: 14, deployment: 14, code_quality: 5, docs: 5, defense: 4 },
    { ui_ux: 9, auth: 13, crud: 18, storage: 9, api: 13, deployment: 14, code_quality: 4, docs: 5, defense: 4 },
    { ui_ux: 8, auth: 13, crud: 17, storage: 8, api: 13, deployment: 13, code_quality: 4, docs: 5, defense: 4 },
  ];
  const submissions: Submission[] = students.slice(3).map((s, i) => ({
    id: `submission-${i}`,
    profile_id: s.id,
    github_url: "https://github.com/vercel/next.js",
    drive_folder_url: "",
    total_marks: [94, 89, 85][i],
    admin_feedback: [
      "Exceptional architecture, seamless user authentication, and high-performance database schema.",
      "Very strong project with clean modular components, solid API handling, and responsive layouts.",
      "Well-structured web application with full CRUD capabilities and clear documentation.",
    ][i],
    evaluation: {
      submission_id: `submission-${i}`,
      student_id: s.id,
      scores: demoScores[i],
      total_score: [94, 89, 85][i],
      feedback: [
        "Exceptional architecture, seamless user authentication, and high-performance database schema.",
        "Very strong project with clean modular components, solid API handling, and responsive layouts.",
        "Well-structured web application with full CRUD capabilities and clear documentation.",
      ][i],
      evaluator_name: "Faculty Jury Panel",
      is_published: true,
    },
    graded: true,
    submitted_at: new Date().toISOString(),
    student_name: s.full_name,
    university_name: s.university_name,
  }));
  return {
    settings: { ...defaultSettings },
    profile: null,
    students: [demoStudent, ...students],
    submissions,
    leaderboard: [],
  };
}
