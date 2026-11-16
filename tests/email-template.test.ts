import test from "node:test";
import assert from "node:assert/strict";
import { renderEmail } from "../src/lib/email-template";
import fs from "node:fs";
test("email content escapes participant data, validates links, and provides a button and fallback", () => {
  const html = renderEmail({
    subject: "Registration",
    heading: "Welcome",
    text: "Hi <img src=x onerror=alert(1)> & builder",
    siteUrl: "https://vspark-web.vercel.app",
    actionLabel: "Dashboard",
    actionUrl: "https://vspark-web.vercel.app/dashboard",
  });
  assert.ok(!html.includes("<img src=x onerror=alert(1)>"));
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("&amp; builder"));
  assert.equal(
    html.split('href="https://vspark-web.vercel.app/dashboard"')
      .length - 1,
    2,
  );
  assert.ok(html.includes('role="presentation"'));
  assert.ok(html.includes('name="viewport"'));
  assert.throws(() =>
    renderEmail({
      subject: "test",
      heading: "test",
      text: "test",
      siteUrl: "https://vspark-web.vercel.app",
      actionLabel: "Open",
      actionUrl: "javascript:alert(1)",
    }),
  );
});
test("Auth templates keep Supabase confirmation URLs and do not expose tokens directly", () => {
  for (const type of ["recovery", "confirmation", "invite"]) {
    const html = fs.readFileSync(`supabase/templates/${type}.html`, "utf8");
    assert.ok(html.includes("{{ .ConfirmationURL }}"));
    assert.ok(html.includes("{{ .SiteURL }}"));
    assert.ok(!html.includes("{{ .Token }}"));
  }
});
