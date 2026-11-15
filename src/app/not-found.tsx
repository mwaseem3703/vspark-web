import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 / A LITTLE OFF TRACK</span>
      <h1>This spark hasn’t landed here.</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link className="btn btn-primary" href="/">
        Back to home ↗
      </Link>
    </main>
  );
}
