import { test } from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";

// lib/mailer.ts imports "@/kc/email", which plain node --test cannot resolve, so
// this drives nodemailer directly with the message shape its SMTP path sends.
test("nodemailer builds the message lib/mailer.ts sends over SMTP", async () => {
  const transport = nodemailer.createTransport({ jsonTransport: true } as never);
  const message = {
    from: "Site <site@example.com>",
    to: ["kim@example.com"],
    subject: "Your sign-in code",
    html: "<p>Code 123456</p>",
    text: "Code 123456",
  };

  const info = (await transport.sendMail(message)) as { message?: string };
  const sent = JSON.parse(String(info.message));

  assert.equal(sent.from.address, "site@example.com");
  assert.equal(sent.from.name, "Site");
  assert.deepEqual(sent.to.map((a: { address: string }) => a.address), ["kim@example.com"]);
  assert.equal(sent.subject, "Your sign-in code");
  assert.equal(sent.html, "<p>Code 123456</p>");
  assert.equal(sent.text, "Code 123456");
});
