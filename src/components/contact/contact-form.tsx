"use client";

import { useState, type FormEvent } from "react";

type ContactFormStrings = {
  intro: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  submit: string;
  missingEmailHint: string;
};

type ContactFormProps = {
  strings: ContactFormStrings;
};

export function ContactForm({ strings }: ContactFormProps) {
  const toEmail =
    (typeof process.env.NEXT_PUBLIC_CONTACT_EMAIL === "string" &&
      process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim()) ||
    "support@bs-commerce.com";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!toEmail) return;

    const subject = encodeURIComponent(
      `[Storefront contact] ${name.trim() || "Visitor"}`,
    );
    const body = encodeURIComponent(
      [`From (reply-to field below — manual paste): ${email}`, "", message.trim()].join("\n"),
    );

    const mailto = `mailto:${encodeURIComponent(toEmail)}?subject=${subject}&body=${body}`;
    if (typeof window !== "undefined") {
      window.location.href = mailto;
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{strings.intro}</p>

      {!toEmail ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {strings.missingEmailHint}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1">
          <span className="text-sm font-medium">{strings.nameLabel}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">{strings.emailLabel}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">{strings.messageLabel}</span>
          <textarea
            name="message"
            rows={5}
            required
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <button
          type="submit"
          disabled={!toEmail}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {strings.submit}
        </button>
      </form>
    </div>
  );
}
