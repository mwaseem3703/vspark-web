"use client";
import Link from "next/link";
import {
  Trophy,
  ArrowUpRight,
  LockKeyhole,
  Sparkles,
  Medal,
  Code2,
} from "lucide-react";
import { PublicShell, EmptyState } from "./shell";
import { useApp } from "./provider";
import { Button } from "./ui/button";
export function ResultsPage() {
  const { data, demo, ready, error, refresh } = useApp();
  if (!demo && (!ready || error))
    return (
      <PublicShell>
        <div className="container">
          <EmptyState
            title={error ? "Results are unavailable." : "Loading results…"}
            description={error || "Checking the latest published results."}
          >
            {error && <Button onClick={refresh}>Try again</Button>}
          </EmptyState>
        </div>
      </PublicShell>
    );
  const entries = demo
    ? data.submissions
        .filter((s) => s.graded)
        .map((s) => ({
          id: s.id,
          full_name:
            s.student_name ||
            data.students.find((p) => p.id === s.profile_id)?.full_name ||
            "Participant",
          university_name:
            s.university_name ||
            data.students.find((p) => p.id === s.profile_id)?.university_name ||
            "",
          total_marks: s.total_marks,
        }))
        .sort(
          (a, b) =>
            b.total_marks - a.total_marks ||
            a.full_name.localeCompare(b.full_name),
        )
    : data.leaderboard;
  let rank = 1;
  const ranked = entries.map((s, i) => {
    if (i > 0 && s.total_marks !== entries[i - 1].total_marks) rank = i + 1;
    return { ...s, rank };
  });
  return (
    <PublicShell>
      <section className="container results-section">
        <div className="results-heading">
          <div className="eyebrow">
            <Sparkles size={15} /> THE WORK. THE CRAFT. THE RECOGNITION.
          </div>
          <h1>
            Built with passion.
            <br />
            <span className="text-blue">Recognized with pride.</span>
          </h1>
          <p>
            {data.settings.results_published
              ? "Meet the builders who turned their ideas into something exceptional."
              : "Good things take great work. The spotlight will be on soon."}
          </p>
        </div>
        {data.settings.results_published ? (
          ranked.length ? (
            <>
              {demo && (
                <div className="sample-results-note">
                  Demo leaderboard · Illustrative participants and scores
                </div>
              )}
              <div className="podium-grid">
                {ranked.slice(0, 3).map((e, i) => (
                  <article
                    className={`podium-card ${["gold", "silver", "bronze"][Math.min(e.rank - 1, 2)]}`}
                    key={e.id}
                  >
                    <div className="podium-medal">
                      <Trophy size={27} />
                    </div>
                    <span className="eyebrow">
                      RANK {String(e.rank).padStart(2, "0")}
                    </span>
                    <div className="avatar avatar-lg">
                      {e.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <h2>{e.full_name}</h2>
                    <p>{e.university_name}</p>
                    <strong className="podium-score">
                      {e.total_marks}
                      <small>/100</small>
                    </strong>
                    <span className="podium-caption">
                      {i === 0
                        ? "A spark above the rest."
                        : "Great ideas, brilliantly built."}
                    </span>
                  </article>
                ))}
              </div>
              <section className="card results-table">
                <div className="card-heading">
                  <h3>The full leaderboard</h3>
                  <span className="count-chip">
                    {ranked.length} evaluated projects
                  </span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>PARTICIPANT</th>
                        <th>UNIVERSITY</th>
                        <th>SCORE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <span className={`rank-badge rank-${e.rank}`}>
                              {e.rank <= 3 ? (
                                <Medal size={18} />
                              ) : (
                                String(e.rank).padStart(2, "0")
                              )}
                            </span>
                          </td>
                          <td>
                            <strong>{e.full_name}</strong>
                          </td>
                          <td>{e.university_name}</td>
                          <td>
                            <strong className="score-number">
                              {e.total_marks}
                            </strong>
                            <span className="muted"> /100</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footnote">
                  Equal scores share the same rank.
                </div>
              </section>
            </>
          ) : (
            <section className="card results-locked">
              <EmptyState
                icon={Code2}
                title="The first great project is on its way."
                description="Evaluated submissions will appear here once available."
              />
            </section>
          )
        ) : (
          <section className="card results-locked">
            <div className="results-orbit">
              <Trophy size={49} strokeWidth={1.2} />
              <span>
                <LockKeyhole size={17} />
              </span>
            </div>
            <div className="eyebrow">THE SPOTLIGHT IS WARMING UP</div>
            <h2>Results are on their way.</h2>
            <p>
              The organizers will publish the leaderboard after evaluations.
              <br />
              Until then, keep that curiosity alive.
            </p>
            <Button variant="outline" asChild>
              <Link
                href={
                  data.profile
                    ? data.profile.role === "admin"
                      ? "/admin"
                      : "/dashboard"
                    : "/"
                }
              >
                {data.profile
                  ? "Back to my workspace"
                  : "Back to the competition"}
                <ArrowUpRight size={16} />
              </Link>
            </Button>
          </section>
        )}
        <div className="results-bottom">
          <Trophy size={19} />
          <p>
            Every finished project is a step forward. Thanks for building with
            us.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
