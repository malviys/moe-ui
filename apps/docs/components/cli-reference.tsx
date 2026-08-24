"use client";

import { Check, Copy, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { type PackageManager, packageManagers } from "@/lib/package-manager";

const initCommands: Record<PackageManager, string> = {
  pnpm: "pnpm dlx @moe-ui/cli@beta init",
  npm: "npx @moe-ui/cli@beta init",
  yarn: "yarn dlx @moe-ui/cli@beta init",
  bun: "bunx @moe-ui/cli@beta init",
};

const examples = [
  {
    label: "Uniwind project",
    command: "pnpm dlx @moe-ui/cli@beta init --styling uniwind",
  },
  {
    label: "NativeWind project",
    command: "pnpm dlx @moe-ui/cli@beta init --styling nativewind --no-install",
  },
  {
    label: "Add components",
    command: "pnpm dlx @moe-ui/cli@beta add button input",
  },
  {
    label: "Resolve a conflict",
    command: "pnpm dlx @moe-ui/cli@beta add button --overwrite",
  },
] as const;

export type CliFlag = {
  name: string;
  value?: string;
  description: string;
};

export function CliQuickStart() {
  const [manager, setManager] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);
  const command = initCommands[manager];

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section
      className="cli-quick-start not-prose"
      aria-labelledby="cli-quick-start-title"
    >
      <div className="cli-quick-start-copy">
        <div className="cli-release-line">
          <span>
            <i aria-hidden />
            beta.1
          </span>
          <span>Node.js 20+</span>
        </div>
        <h2 id="cli-quick-start-title">Start with one command.</h2>
        <p>
          Detect the framework, choose a styling engine, and create the complete
          Moe UI foundation without leaving your terminal.
        </p>
        <ul className="cli-capability-list" aria-label="Supported platforms">
          <li>Next.js</li>
          <li>Expo</li>
          <li>Uniwind</li>
          <li>NativeWind</li>
        </ul>
      </div>

      <div className="cli-terminal-card">
        <div className="cli-terminal-titlebar">
          <span aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <strong>Terminal</strong>
          <SquareTerminal aria-hidden />
        </div>
        <fieldset className="cli-package-tabs">
          <legend className="sr-only">Package manager</legend>
          {packageManagers.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={manager === item}
              data-active={manager === item}
              onClick={() => setManager(item)}
            >
              {item}
            </button>
          ))}
        </fieldset>
        <div className="cli-terminal-command">
          <span aria-hidden>$</span>
          <code>{command}</code>
          <button type="button" onClick={copyCommand} aria-label="Copy command">
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          </button>
        </div>
        <div className="cli-terminal-result" aria-hidden>
          <span>✓ Project detected</span>
          <span>✓ Theme configured</span>
          <span>✓ Ready to add components</span>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? "Command copied" : ""}
        </span>
      </div>
    </section>
  );
}

export function CliCommand({
  usage,
  summary,
  flags,
}: {
  usage: string;
  summary: string;
  flags: CliFlag[];
}) {
  const [copied, setCopied] = useState(false);

  async function copyUsage() {
    await navigator.clipboard.writeText(usage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="cli-command-reference not-prose">
      <div className="cli-command-usage">
        <div>
          <span aria-hidden>$</span>
          <code>{usage}</code>
        </div>
        <button type="button" onClick={copyUsage} aria-label="Copy usage">
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </button>
      </div>
      <p>{summary}</p>
      <dl className="cli-flag-list">
        {flags.map((flag) => (
          <div key={flag.name}>
            <dt>
              <code>{flag.name}</code>
              {flag.value ? <span>{flag.value}</span> : null}
            </dt>
            <dd>{flag.description}</dd>
          </div>
        ))}
      </dl>
      <span className="sr-only" aria-live="polite">
        {copied ? "Usage copied" : ""}
      </span>
    </section>
  );
}

export function CliExamples() {
  const [copied, setCopied] = useState<string>();

  async function copyExample(command: string) {
    await navigator.clipboard.writeText(command);
    setCopied(command);
    window.setTimeout(() => setCopied(undefined), 1600);
  }

  return (
    <div className="cli-example-list not-prose">
      {examples.map((example) => (
        <div key={example.command}>
          <span>{example.label}</span>
          <div>
            <code>{example.command}</code>
            <button
              type="button"
              onClick={() => copyExample(example.command)}
              aria-label={`Copy ${example.label} example`}
            >
              {copied === example.command ? (
                <Check aria-hidden />
              ) : (
                <Copy aria-hidden />
              )}
            </button>
          </div>
        </div>
      ))}
      <span className="sr-only" aria-live="polite">
        {copied ? "Example copied" : ""}
      </span>
    </div>
  );
}
