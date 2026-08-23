"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyCommand({
  command,
  label = "Copy command",
}: {
  command: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="command-shell">
      <span className="command-prompt" aria-hidden>
        $
      </span>
      <code>{command}</code>
      <button type="button" onClick={copyCommand} aria-label={label}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Command copied" : ""}
      </span>
    </div>
  );
}
