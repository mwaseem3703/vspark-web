import test from "node:test";
import assert from "node:assert/strict";
import {
  eventState,
  allowedPath,
  validGithub,
  whatsapp,
} from "../src/lib/competition";
const schedule = {
  start_time: "2026-11-01T10:00:00Z",
  end_time: "2026-11-01T13:00:00Z",
  submission_mode: "scheduled" as const,
};
test("schedule opens exactly at start and closes exactly at end", () => {
  assert.equal(
    eventState(schedule, Date.parse("2026-11-01T09:59:59Z")),
    "upcoming",
  );
  assert.equal(eventState(schedule, Date.parse(schedule.start_time)), "open");
  assert.equal(eventState(schedule, Date.parse(schedule.end_time)), "closed");
});
test("manual close overrides a running event; manual open overrides a future schedule", () => {
  assert.equal(
    eventState(
      { ...schedule, submission_mode: "closed" },
      Date.parse(schedule.start_time),
    ),
    "closed",
  );
  assert.equal(
    eventState(
      { ...schedule, submission_mode: "open" },
      Date.parse("2026-10-01T00:00:00Z"),
    ),
    "open",
  );
});
test("source filtering rejects secrets, dependencies, build output, and traversal", () => {
  for (const p of [
    "app/.env",
    "app/.env.local",
    "app/.ENV.local",
    "app/.npmrc",
    "__proto__/x",
    "app/constructor/x",
    "app/node_modules/a.js",
    "app/.next/server.js",
    "app/.git/config",
    "../secret",
    "app/../../secret",
    "/absolute/path",
    "app//a",
    "app/private.pem",
    "app/private.key",
    "app/.vercel/config",
    "app\u0000.js",
  ])
    assert.equal(allowedPath(p), false, p);
  for (const p of [
    "app/src/page.tsx",
    "app/package.json",
    "app/public/hero.svg",
    "app/README.md",
  ])
    assert.equal(allowedPath(p), true, p);
});
test("GitHub URLs cannot point to other hosts or non-HTTPS repositories", () => {
  assert.equal(validGithub("https://github.com/user/project"), true);
  for (const url of [
    "https://github.com.evil.test/user/repo",
    "http://github.com/user/repo",
    "https://github.com/user",
    "https://github.com/user/repo?x=1",
    "https://user:pass@github.com/user/repo",
    "javascript:alert(1)",
  ])
    assert.equal(validGithub(url), false, url);
});
test("WhatsApp links strip formatting and international dial prefix", () => {
  assert.equal(whatsapp("+92 (300) 123-4567"), "https://wa.me/923001234567");
  assert.equal(whatsapp("0092 300 1234567"), "https://wa.me/923001234567");
});
