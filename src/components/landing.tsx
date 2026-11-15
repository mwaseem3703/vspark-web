"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Terminal,
  Check,
  Globe2,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Trophy,
  Zap,
  ChevronRight,
  ShieldCheck,
  Github,
  Layers3,
  MousePointer2,
  Plus,
} from "lucide-react";
import { useApp } from "./provider";
import { PublicShell, TextLink, EmptyState } from "./shell";
import { Button } from "./ui/button";
import { dateLabel } from "@/lib/utils";
export function Landing() {
  const { data, demo, ready, error, refresh } = useApp();
  const s = data.settings;
  if (!demo && (!ready || error))
    return (
      <PublicShell>
        <div className="container">
          <EmptyState
            title={
              error
                ? "Competition details are unavailable."
                : "Loading the competition…"
            }
            description={
              error || "Getting the latest information from the organizers."
            }
          >
            {error && <Button onClick={refresh}>Try again</Button>}
          </EmptyState>
        </div>
      </PublicShell>
    );
  return (
    <PublicShell>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="pill">
              <span className="blue-dot" />
              UNIVERSITY WEB DEVELOPMENT CHALLENGE <ArrowUpRight size={13} />
            </div>
            <h1>
              Your ideas.
              <br />
              Your code.
              <br />
              <span>Your moment.</span>
              <svg
                className="hero-scribble"
                viewBox="0 0 350 15"
                aria-hidden="true"
              >
                <path
                  d="M3 10 Q160 -1 345 7 M25 14 Q185 4 320 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p>
              A challenge for the builders, the problem-solvers,
              <br className="desktop-break" /> and the ones who ask, “what if?”
              <br className="desktop-break" /> Bring your skills. Build
              something that matters.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link href="/register">
                  I’m ready to build <ArrowUpRight size={19} />
                </Link>
              </Button>
              <Link href="#challenge" className="hero-secondary">
                Explore the challenge <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-footnote">
              <ShieldCheck size={15} />
              <span>Open to university students</span>
              <span className="dot-separator">·</span>
              <span>All skill levels welcome</span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Illustration of a web development workspace"
          >
            <div className="art-grid" />
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="float-label float-label-top">
              <span>
                <Code2 size={17} />
              </span>
              IDEAS INTO IMPACT
            </div>
            <div className="code-window">
              <div className="window-bar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>your-next-big-idea.tsx</span>
                <Code2 size={14} />
              </div>
              <div className="code-body">
                <div className="code-line">
                  <span>01</span>
                  <code>
                    <b>const</b> possibility = <em>"endless"</em>;
                  </code>
                </div>
                <div className="code-line">
                  <span>02</span>
                  <code />
                </div>
                <div className="code-line">
                  <span>03</span>
                  <code>
                    <b>function</b> <strong>BuildYourFuture</strong>() {"{"}
                  </code>
                </div>
                <div className="code-line">
                  <span>04</span>
                  <code>
                    &nbsp; <b>return</b> (
                  </code>
                </div>
                <div className="code-line">
                  <span>05</span>
                  <code>
                    &nbsp; &nbsp; &lt;<strong>YourNextBigIdea</strong>
                  </code>
                </div>
                <div className="code-line">
                  <span>06</span>
                  <code>
                    &nbsp; &nbsp; &nbsp; passion={"{"}
                    <em>true</em>
                    {"}"}
                  </code>
                </div>
                <div className="code-line">
                  <span>07</span>
                  <code>
                    &nbsp; &nbsp; &nbsp; limits={"{"}
                    <em>null</em>
                    {"}"}
                  </code>
                </div>
                <div className="code-line">
                  <span>08</span>
                  <code>&nbsp; &nbsp; /&gt;</code>
                </div>
                <div className="code-line">
                  <span>09</span>
                  <code>&nbsp; );</code>
                </div>
                <div className="code-line">
                  <span>10</span>
                  <code>
                    {"}"}
                    <span className="code-cursor" />
                  </code>
                </div>
              </div>
              <div className="code-status">
                <span>
                  <span className="online-dot" /> Ready to create
                </span>
                <span>
                  TypeScript <Check size={11} />
                </span>
              </div>
            </div>
            <div className="build-card">
              <div className="build-icon">
                <Zap fill="currentColor" size={22} />
              </div>
              <div>
                <strong>Your potential, deployed.</strong>
                <span>One challenge. Endless possibilities.</span>
              </div>
              <span className="build-check">
                <Check size={16} />
              </span>
            </div>
            <div className="float-label float-label-bottom">
              <Sparkles size={17} /> BUILT BY YOU.
            </div>
            <div className="cursor-label">
              <MousePointer2 fill="currentColor" size={23} />
              <span>You, making things happen</span>
            </div>
            <span className="art-plus plus-one">+</span>
            <span className="art-plus plus-two">+</span>
            <div className="art-caption">
              IMAGINE. BUILD. GO BEYOND. <span>↗</span>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="event-strip" data-reveal="rise">
            <div>
              <CalendarDays size={19} />
              <span>
                <small>THE DATE</small>
                <strong>
                  {demo || s.submission_mode === "closed"
                    ? "Date to be announced"
                    : dateLabel(s.start_time)}
                </strong>
              </span>
            </div>
            <div>
              <Clock3 size={19} />
              <span>
                <small>THE CHALLENGE</small>
                <strong>
                  {Math.round(
                    (Date.parse(s.end_time) - Date.parse(s.start_time)) /
                      3600000,
                  )}{" "}
                  hours. Your best work.
                </strong>
              </span>
            </div>
            <div>
              <MapPin size={19} />
              <span>
                <small>THE COMMUNITY</small>
                <strong>University builders & creators</strong>
              </span>
            </div>
            <Link href="/register">
              Your next chapter starts here <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>
      <section id="challenge" className="section container">
        <div className="section-heading" data-reveal="left">
          <div>
            <div className="eyebrow">
              <span className="tiny-line" /> A LITTLE CODE. A LOT OF
              POSSIBILITY.
            </div>
            <h2>
              More than a competition.
              <br />A chance to{" "}
              <span className="text-blue">make your mark.</span>
            </h2>
          </div>
          <p>
            Take on a real challenge. Turn a blank canvas into something
            meaningful. Show us how you think, design, and build.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card" data-reveal="card">
            <span className="feature-icon">
              <Code2 size={25} />
            </span>
            <span className="feature-number">01 / BUILD</span>
            <h3>From “what if” to “it works.”</h3>
            <p>
              A focused web development challenge that puts your ideas and
              problem-solving skills in the spotlight.
            </p>
            <span className="feature-tag">Real problems. Real solutions.</span>
          </article>
          <article className="feature-card" data-reveal="card">
            <span className="feature-icon violet">
              <Layers3 size={25} />
            </span>
            <span className="feature-number">02 / CREATE</span>
            <h3>Your stack. Your approach.</h3>
            <p>
              Bring the tools you love. We value thoughtful experiences, clean
              code, and the craft behind every detail.
            </p>
            <span className="feature-tag">Made with your perspective.</span>
          </article>
          <article className="feature-card" data-reveal="card">
            <span className="feature-icon mint">
              <Globe2 size={25} />
            </span>
            <span className="feature-number">03 / CONNECT</span>
            <h3>Find your kind of people.</h3>
            <p>
              Join a community of curious university minds. Learn from the
              experience and leave with something you’re proud of.
            </p>
            <span className="feature-tag">Good ideas grow together.</span>
          </article>
        </div>
      </section>
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="section-heading" data-reveal="left">
            <div>
              <div className="eyebrow">
                <span className="tiny-line" /> YOUR JOURNEY
              </div>
              <h2>
                Four steps.
                <br />
                One unforgettable challenge.
              </h2>
            </div>
            <TextLink href="/register">Let’s get you started</TextLink>
          </div>
          <div className="steps-grid">
            {[
              {
                title: "Save your spot",
                text: "Create your account with your university details and attach your registration fee deposit receipt (Rs. 500).",
                icon: Plus,
              },
              {
                title: "Get the green light",
                text: "Our organizers review your registration. We’ll email you once your account is approved.",
                icon: ShieldCheck,
              },
              {
                title: "Build your best",
                text: "When the challenge starts, open your dashboard, read the task, and bring your idea to life.",
                icon: Terminal,
              },
              {
                title: "Submit & shine",
                text: "Share your GitHub repository and project folder. Get evaluated and see where you stand.",
                icon: Trophy,
              },
            ].map((step, i) => (
              <article className="step" data-reveal="step" key={step.title}>
                <div className="step-top">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <step.icon size={20} />
                  {i < 3 && <ChevronRight className="step-arrow" size={16} />}
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="prizes" className="section container">
        <div className="section-heading" data-reveal="left">
          <div>
            <div className="eyebrow">
              <span className="tiny-line" /> THE RECOGNITION
            </div>
            <h2>
              Great work deserves
              <br />
              its moment in the spotlight.
            </h2>
          </div>
          <p>
            Bring your best. Top submissions earn a place on the leaderboard and
            recognition for their work.
          </p>
        </div>
        <div className="prizes-grid">
          {[
            {
              rank: "01",
              title:
                s.prizes[0] && s.prizes[0] !== "null"
                  ? s.prizes[0]
                  : "1st Place: Trophy + Certificate",
              style: "gold",
              label: "THE STANDOUT",
            },
            {
              rank: "02",
              title:
                s.prizes[1] && s.prizes[1] !== "null"
                  ? s.prizes[1]
                  : "2nd Place: Trophy + Certificate",
              style: "silver",
              label: "THE TRAILBLAZER",
            },
            {
              rank: "03",
              title:
                s.prizes[2] && s.prizes[2] !== "null"
                  ? s.prizes[2]
                  : "3rd Place: Trophy + Certificate",
              style: "bronze",
              label: "THE RISING SPARK",
            },
          ].map((p) => (
            <article
              className={`prize-card ${p.style}`}
              data-reveal="prize"
              key={p.rank}
            >
              <div className="prize-top">
                <span>{p.label}</span>
                <Trophy size={22} />
              </div>
              <div className="prize-rank">
                {p.rank}
                <span>↗</span>
              </div>
              <h3>{p.title}</h3>
              <p>Recognizing exceptional ideas and execution.</p>
            </article>
          ))}
        </div>
        <p className="section-note">
          Final prizes and event details will be confirmed by the organizers.
        </p>
      </section>
      <section className="container guidelines-section">
        <div className="guidelines-copy" data-reveal="left">
          <div className="eyebrow">GOOD TO KNOW</div>
          <h2>
            A few things
            <br />
            before you begin.
          </h2>
          <p>Everything you need for a smooth start.</p>
        </div>
        <div className="faq-list" data-reveal="right">
          {[
            {
              q: "Who can take part?",
              a: "University students at every skill level are welcome. Register with your name, contact details, and university, then wait for organizer approval.",
            },
            {
              q: "What is the registration fee?",
              a: "The registration fee is Rs. 500 per team / participant. Transfer the fee to the official bank account details provided below and attach your payment receipt during registration for verification.",
            },
            {
              q: "How will my work be evaluated?",
              a: "Your project will be evaluated on the 100-point rubric (UI/UX 10, Auth 15, CRUD 20, Storage 10, API 15, Deployment 15, Code Quality 5, README 5, Live Demo 5). Results will be published on the leaderboard.",
            },
            {
              q: "What should I submit?",
              a: "Submit an HTTPS GitHub repository link and upload your clean project folder to the official Google Drive destination. Ensure your app is deployed live on Vercel.",
            },
          ].map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <Plus size={17} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      {s.bank_account && s.bank_account !== "null" && (
        <section className="container bank-section">
          <div>
            <div className="eyebrow">REGISTRATION & PAYMENT</div>
            <h3>Registration Fee: Rs. 500</h3>
            <p>Please transfer the registration fee to the official account and upload your payment slip screenshot.</p>
          </div>
          <dl>
            <div>
              <dt>Bank</dt>
              <dd>{s.bank_name && s.bank_name !== "null" ? s.bank_name : "Easypaisa / HBL"}</dd>
            </div>
            <div>
              <dt>Account title</dt>
              <dd>{s.bank_title && s.bank_title !== "null" ? s.bank_title : "COMSATS Web Society"}</dd>
            </div>
            <div>
              <dt>Account number</dt>
              <dd>{s.bank_account && s.bank_account !== "null" ? s.bank_account : "0123 4567 8901 23"}</dd>
            </div>
            {s.bank_iban && s.bank_iban !== "null" && (
              <div>
                <dt>IBAN</dt>
                <dd>{s.bank_iban}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
      <section className="container">
        <div className="cta-section" data-reveal="spotlight">
          <div className="eyebrow">
            <Zap size={15} /> YOUR NEXT BIG THING STARTS SMALL.
          </div>
          <h2>
            Ready to find
            <br />
            your spark?
          </h2>
          <p>You bring the curiosity. We’ll bring the challenge.</p>
          <Button asChild size="lg">
            <Link href="/register">
              Count me in <ArrowUpRight size={18} />
            </Link>
          </Button>
          <span className="cta-decoration" aria-hidden="true">
            ✳
          </span>
          <div className="cta-corner" aria-hidden="true">
            &lt;/&gt;
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
