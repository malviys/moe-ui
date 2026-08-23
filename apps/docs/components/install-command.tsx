"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAddCommand,
  type PackageManager,
  packageManagers,
} from "@/lib/package-manager";

const storageKey = "moe-ui-docs-package-manager";

export function InstallCommand({ name }: { name: string }) {
  const [manager, setManager] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);
  const command = getAddCommand(name, manager);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (packageManagers.includes(stored as PackageManager)) {
      setManager(stored as PackageManager);
    }
  }, []);

  function selectManager(nextManager: PackageManager) {
    setManager(nextManager);
    window.localStorage.setItem(storageKey, nextManager);
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section
      className="install-command"
      data-testid={`install-source-${name}`}
      aria-labelledby={`install-${name}`}
    >
      <div className="install-command-heading">
        <div>
          <p className="eyebrow">One command, your source</p>
          <h2 id={`install-${name}`}>Installation</h2>
        </div>
        <fieldset className="package-manager-list">
          <legend className="sr-only">Package manager</legend>
          {packageManagers.map((item) => (
            <button
              key={item}
              type="button"
              data-active={manager === item}
              aria-pressed={manager === item}
              onClick={() => selectManager(item)}
            >
              {item}
            </button>
          ))}
        </fieldset>
      </div>
      <div className="install-command-line">
        <span aria-hidden>$</span>
        <code>{command}</code>
        <button
          type="button"
          onClick={copyCommand}
          aria-label={`Copy ${manager} installation command`}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? "Installation command copied" : ""}
      </span>
    </section>
  );
}
