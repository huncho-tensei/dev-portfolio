"use server";

import { Resend } from "resend";

export type ContactState = {
  status: "idle" | "success" | "error" | "unconfigured";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  // honeypot, bots fill hidden fields
  const trap = String(formData.get("company") ?? "").trim();

  if (trap) return { status: "success", message: "Thanks, message sent." };

  if (name.length < 2)
    return { status: "error", message: "Please add your name." };
  if (!EMAIL_RE.test(email))
    return { status: "error", message: "That email doesn't look right." };
  if (message.length < 10)
    return { status: "error", message: "Tell me a little more (10+ characters)." };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    // Graceful fallback until env vars are configured.
    return {
      status: "unconfigured",
      message:
        "The form is not wired to an inbox yet. Reach me on GitHub or LinkedIn in the meantime.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) throw new Error(error.message);
    return { status: "success", message: "Thanks, your message is on its way." };
  } catch {
    return {
      status: "error",
      message: "Something broke sending that. Try again, or reach me on LinkedIn.",
    };
  }
}
