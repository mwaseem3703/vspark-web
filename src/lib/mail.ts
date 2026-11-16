import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { renderEmail } from "./email-template";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://vspark-web.vercel.app"
  ).replace(/\/+$/, "");
}

function getTransport() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 10000,
  });
}

function getLogoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "vspark.png");
  const hasLogo = fs.existsSync(logoPath);
  return {
    hasLogo,
    attachments: hasLogo
      ? [
          {
            filename: "vspark.png",
            path: logoPath,
            cid: "vsparklogo",
          },
        ]
      : [],
  };
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  design?: {
    heading: string;
    actionLabel: string;
    actionUrl: string;
    preheader?: string;
  },
) {
  const transport = getTransport();
  if (!transport) return false;

  try {
    const { hasLogo, attachments } = getLogoAttachment();
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;

    await transport.sendMail({
      from: `"VSpark Competition" <${user}>`,
      to,
      subject,
      text,
      html: renderEmail({
        subject,
        text,
        heading: design?.heading || subject,
        ...design,
        siteUrl: getSiteUrl(),
        hasLogoCid: hasLogo,
      }),
      attachments,
    });
    return true;
  } catch (err) {
    console.error("Competition email delivery failed. Check SMTP configuration.", err);
    return false;
  }
}

/**
 * Send Team Registration Confirmation to both Leader and Teammate
 */
export async function sendTeamRegistrationEmails({
  leaderEmail,
  leaderName,
  teammateEmail,
  teammateName,
  teamName,
}: {
  leaderEmail: string;
  leaderName: string;
  teammateEmail: string;
  teammateName: string;
  teamName: string;
}) {
  const siteUrl = getSiteUrl();

  // 1. Send to Team Leader
  const leaderText = `Hi ${leaderName},\n\nYour team "${teamName}" has been registered for the VSpark 2026 Web Competition and is awaiting faculty admin verification.\n\nTeam Details:\n• Team Name: ${teamName}\n• Role: Team Leader & Submitter (Only you can submit project code & repository)\n• Teammate: ${teammateName} (${teammateEmail})\n\nWe will verify your deposit receipt and email you once your team is approved.\n\nThe VSpark Team`;
  await sendEmail(
    leaderEmail,
    `VSpark — Team "${teamName}" Registration Received`,
    leaderText,
    {
      heading: `Team "${teamName}" Registered`,
      preheader: `Team ${teamName} registration received. Awaiting faculty verification.`,
      actionLabel: "View Registration Status",
      actionUrl: `${siteUrl}/pending`,
    },
  );

  // 2. Send to Member 2 (Teammate)
  const memberText = `Hi ${teammateName},\n\nYou have been added as a Team Member to "${teamName}" by your team leader, ${leaderName}, for the VSpark 2026 Web Competition!\n\nTeam Details:\n• Team Name: ${teamName}\n• Team Leader: ${leaderName} (${leaderEmail})\n• Your Role: Team Member (You can log in to view the live brief, guidelines, and submission results)\n• Sign In: You can log in using this email (${teammateEmail}) and the password chosen during registration.\n\nYour team registration is currently under review by the faculty organizers. You will receive an approval email once verified.\n\nThe VSpark Team`;
  await sendEmail(
    teammateEmail,
    `VSpark — You Were Added to Team "${teamName}"`,
    memberText,
    {
      heading: `Welcome to Team "${teamName}"!`,
      preheader: `You've been added to team ${teamName} by ${leaderName}.`,
      actionLabel: "View Registration Status",
      actionUrl: `${siteUrl}/pending`,
    },
  );
}

/**
 * Send Team Approval Notification to a Team Member
 */
export async function sendTeamApprovalEmail({
  to,
  studentName,
  teamName,
  isLeader,
  partnerName,
}: {
  to: string;
  studentName: string;
  teamName: string;
  isLeader: boolean;
  partnerName: string;
}) {
  const siteUrl = getSiteUrl();
  const roleDesc = isLeader
    ? "As the Team Leader, you will have exclusive access to submit your project files and GitHub repository."
    : `Your Team Leader (${partnerName}) will submit your project files and GitHub repository on behalf of your team. You can view the live countdown, problem brief, and evaluations from your dashboard.`;

  const text = `Hi ${studentName},\n\nGreat news! Your team "${teamName}" has been approved by the faculty administrators for the VSpark 2026 Web Competition.\n\n${roleDesc}\n\nLog in to your student dashboard to review the schedule, live announcement, and competition brief.\n\nSee you at the challenge!\nThe VSpark Team`;

  return await sendEmail(
    to,
    `VSpark — Team "${teamName}" Approved!`,
    text,
    {
      heading: `Team "${teamName}" is Approved!`,
      preheader: `Your team ${teamName} is approved. Log in to your student dashboard.`,
      actionLabel: "Open Student Dashboard",
      actionUrl: `${siteUrl}/dashboard`,
    },
  );
}

/**
 * Send official Task Announcement & Problem Brief Email to a list of students via BCC
 */
export async function sendTaskAnnouncementEmail({
  recipients,
  competitionTitle,
  startTime,
  endTime,
  taskPdfUrl,
  taskSummary,
}: {
  recipients: string[];
  competitionTitle?: string;
  startTime?: string;
  endTime?: string;
  taskPdfUrl?: string;
  taskSummary?: string;
}) {
  if (!recipients.length) return false;
  const transport = getTransport();
  if (!transport) return false;

  const siteUrl = getSiteUrl();
  const title = competitionTitle || "VSpark 2026 Web Development Hackathon";
  const { hasLogo, attachments } = getLogoAttachment();
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;

  const bodyText = [
    `The official problem brief and guidelines for ${title} are now live!`,
    startTime ? `• Start Time: ${new Date(startTime).toLocaleString()}` : "",
    endTime ? `• Code Freeze Deadline: ${new Date(endTime).toLocaleString()}` : "",
    taskSummary ? `\nChallenge Brief:\n${taskSummary}` : "",
    `\nSign in to your competition dashboard to access problem statements and submit your project.`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = renderEmail({
    subject: `🚀 Problem Brief Released: ${title}`,
    heading: "Challenge Brief Now Active!",
    text: bodyText,
    actionLabel: "Open Student Dashboard",
    actionUrl: `${siteUrl}/dashboard`,
    category: "Competition Challenge Release",
    securityNote: "Submissions lock strictly at the Code Freeze deadline. Ensure your GitHub repo is public and contains clean code.",
    siteUrl,
    hasLogoCid: hasLogo,
  });

  try {
    await transport.sendMail({
      from: `VSpark Competition <${user}>`,
      to: user,
      bcc: recipients,
      subject: `🚀 Problem Brief Released: ${title}`,
      text: bodyText,
      html,
      attachments,
    });
    return true;
  } catch (err) {
    console.error("Failed to send task announcement:", err);
    return false;
  }
}

/**
 * Send Custom Announcement Notice to students via BCC
 */
export async function sendBroadcastNoticeEmail({
  recipients,
  subject,
  messageBody,
  targetAudience,
}: {
  recipients: string[];
  subject: string;
  messageBody: string;
  targetAudience?: string;
}) {
  if (!recipients.length) return false;
  const transport = getTransport();
  if (!transport) return false;

  const siteUrl = getSiteUrl();
  const { hasLogo, attachments } = getLogoAttachment();
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;

  const html = renderEmail({
    subject: `[VSpark Notice] ${subject}`,
    heading: subject,
    text: messageBody,
    actionLabel: "Visit Competition Portal",
    actionUrl: `${siteUrl}/dashboard`,
    category: `Official Broadcast (${targetAudience || "All Students"})`,
    siteUrl,
    hasLogoCid: hasLogo,
  });

  try {
    await transport.sendMail({
      from: `VSpark Administration <${user}>`,
      to: user,
      bcc: recipients,
      subject: `[VSpark Notice] ${subject}`,
      text: messageBody,
      html,
      attachments,
    });
    return true;
  } catch (err) {
    console.error("Failed to send broadcast notice:", err);
    return false;
  }
}

/**
 * Send Direct 1-on-1 Message from Admin to a Student
 */
export async function sendDirectStudentEmail({
  to,
  studentName,
  subject,
  messageBody,
}: {
  to: string;
  studentName?: string;
  subject: string;
  messageBody: string;
}) {
  const siteUrl = getSiteUrl();
  const greeting = studentName ? `Dear ${studentName},\n\n` : "";
  const fullText = `${greeting}${messageBody}`;

  return await sendEmail(to, `[VSpark] ${subject}`, fullText, {
    heading: subject,
    actionLabel: "Open Student Dashboard",
    actionUrl: `${siteUrl}/dashboard`,
  });
}

/**
 * Send Workspace Unlocked / Resubmission Notification to a Student
 */
export async function sendResubmissionUnlockedEmail({
  to,
  studentName,
  competitionTitle,
}: {
  to: string;
  studentName?: string;
  competitionTitle?: string;
}) {
  const siteUrl = getSiteUrl();
  const name = studentName || "Participant";
  const comp = competitionTitle || "VSpark 2026 Web Development Competition";
  const subject = `Workspace Unlocked: Resubmission Permitted - ${comp}`;

  const message = `Hello ${name},

The competition organizers have unlocked your submission workspace.

You have now been granted permission to re-upload your project files and update your GitHub repository URL.

Please visit your workspace promptly to complete your updated submission.`;

  return await sendEmail(to, subject, message, {
    heading: "Workspace Unlocked for Resubmission",
    actionLabel: "Open Submission Workspace",
    actionUrl: `${siteUrl}/task`,
    preheader: "Your project workspace has been unlocked by organizers.",
  });
}

/**
 * Send Password Reset Link to a Student
 */
export async function sendPasswordResetEmail({
  to,
  studentName,
  resetUrl,
}: {
  to: string;
  studentName?: string;
  resetUrl: string;
}) {
  const siteUrl = getSiteUrl();
  const name = studentName || "Participant";
  const text = `Dear ${name},\n\nA password reset was requested for your registered student account (${to}).\n\nClick the button below to choose a new password and restore full access to your student dashboard.`;

  return await sendEmail(
    to,
    "[Action Required] Reset Your VSpark Password",
    text,
    {
      heading: "Reset Your Account Password",
      actionLabel: "Reset Password",
      actionUrl: resetUrl,
      preheader: `Password reset request for ${to}`,
    },
  );
}

/**
 * Send Podium Winner Celebration Email (Rank 1, 2, or 3)
 */
export async function sendPodiumWinnerEmail({
  to,
  studentName,
  rank,
  totalMarks,
}: {
  to: string;
  studentName: string;
  rank: number;
  totalMarks: number;
}) {
  const siteUrl = getSiteUrl();
  const medal = rank === 1 ? "🥇 1st Place" : rank === 2 ? "🥈 2nd Place" : "🥉 3rd Place";
  const text = `Dear ${studentName},\n\nCongratulations! We are thrilled to announce that you have achieved ${medal} in the VSpark 2026 Web Engineering Competition with a validated score of ${totalMarks}/100!\n\nOn behalf of COMSATS University Islamabad, Vehari Campus and the COMSATS Web Society, we commend your outstanding technical execution, architecture, and live presentation.\n\nView the official rankings and leaderboard on the competition portal.`;

  return await sendEmail(
    to,
    `🏆 Congratulations! You Won ${medal} - VSpark 2026`,
    text,
    {
      heading: `Congratulations, ${studentName}! ${medal}`,
      actionLabel: "View Official Results",
      actionUrl: `${siteUrl}/results`,
    },
  );
}

/**
 * Send General Results Announcement to All Participants
 */
export async function sendResultsGeneralEmail({
  recipients,
}: {
  recipients: string[];
}) {
  if (!recipients.length) return false;
  const transport = getTransport();
  if (!transport) return false;

  const siteUrl = getSiteUrl();
  const { hasLogo, attachments } = getLogoAttachment();
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;

  const text = `The evaluation for the VSpark 2026 Web Engineering Competition has officially concluded.\n\nAll submitted projects have been evaluated across the 100-point rubric. We extend our warmest appreciation to all participants for showcasing incredible engineering skill, design polish, and creativity.\n\nCheck your final score, detailed jury feedback, and the full leaderboard on the competition results page.`;

  const html = renderEmail({
    subject: "📢 Official VSpark 2026 Results & Rankings Announced!",
    heading: "Competition Results Are Live!",
    text,
    actionLabel: "Check Official Leaderboard",
    actionUrl: `${siteUrl}/results`,
    category: "Competition Results",
    siteUrl,
    hasLogoCid: hasLogo,
  });

  try {
    await transport.sendMail({
      from: `VSpark Competition <${user}>`,
      to: user,
      bcc: recipients,
      subject: "📢 Official VSpark 2026 Results & Rankings Announced!",
      text,
      html,
      attachments,
    });
    return true;
  } catch (err) {
    console.error("Failed to send results announcement:", err);
    return false;
  }
}
