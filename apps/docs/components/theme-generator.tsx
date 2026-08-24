"use client";

import {
  Check,
  Code2,
  Copy,
  LayoutGrid,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

type Engine = "uniwind" | "nativewind";
type PreviewMode = "light" | "dark";
type StudioView = "preview" | "code";
type ThemeSettings = { hue: number; chroma: number; radius: number };
type ThemeTokens = Record<string, string>;
type PreviewStyle = CSSProperties & Record<`--tg-${string}`, string>;

const defaultSettings: ThemeSettings = {
  hue: 25,
  chroma: 0.18,
  radius: 0.625,
};

const presets = [
  { name: "Ember", hue: 25, chroma: 0.18 },
  { name: "Moss", hue: 145, chroma: 0.14 },
  { name: "Tide", hue: 230, chroma: 0.14 },
  { name: "Plum", hue: 305, chroma: 0.15 },
  { name: "Graphite", hue: 260, chroma: 0.03 },
] as const;

const tokenOrder = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
] as const;

function oklch(lightness: number, chroma: number, hue: number) {
  const l = Math.round(lightness * 1000) / 10;
  const c = Math.round(chroma * 1000) / 1000;
  return `oklch(${l}% ${c} ${Math.round(hue)})`;
}

function createTokens(
  mode: PreviewMode,
  { hue, chroma }: ThemeSettings,
): ThemeTokens {
  if (mode === "dark") {
    return {
      background: oklch(0.145, 0.018, hue),
      foreground: oklch(0.975, 0.006, hue),
      card: oklch(0.19, 0.022, hue),
      "card-foreground": oklch(0.975, 0.006, hue),
      popover: oklch(0.19, 0.022, hue),
      "popover-foreground": oklch(0.975, 0.006, hue),
      primary: oklch(0.72, chroma, hue),
      "primary-foreground": oklch(0.15, 0.025, hue),
      secondary: oklch(0.27, 0.035, hue),
      "secondary-foreground": oklch(0.96, 0.008, hue),
      muted: oklch(0.25, 0.025, hue),
      "muted-foreground": oklch(0.7, 0.02, hue),
      accent: oklch(0.3, Math.max(chroma * 0.35, 0.03), hue),
      "accent-foreground": oklch(0.96, 0.008, hue),
      destructive: "oklch(52% 0.2 29)",
      border: oklch(0.31, 0.03, hue),
      input: oklch(0.31, 0.03, hue),
      ring: oklch(0.72, chroma, hue),
    };
  }

  return {
    background: oklch(0.99, 0.006, hue),
    foreground: oklch(0.16, 0.02, hue),
    card: oklch(1, 0.003, hue),
    "card-foreground": oklch(0.16, 0.02, hue),
    popover: oklch(1, 0.003, hue),
    "popover-foreground": oklch(0.16, 0.02, hue),
    primary: oklch(0.55, chroma, hue),
    "primary-foreground": oklch(0.985, 0.006, hue),
    secondary: oklch(0.95, 0.03, hue),
    "secondary-foreground": oklch(0.24, 0.035, hue),
    muted: oklch(0.955, 0.018, hue),
    "muted-foreground": oklch(0.5, 0.03, hue),
    accent: oklch(0.93, Math.max(chroma * 0.3, 0.025), hue),
    "accent-foreground": oklch(0.26, Math.max(chroma * 0.5, 0.04), hue),
    destructive: "oklch(55% 0.22 29)",
    border: oklch(0.89, 0.025, hue),
    input: oklch(0.89, 0.025, hue),
    ring: oklch(0.55, chroma, hue),
  };
}

function tokenLines(tokens: ThemeTokens, indent: string) {
  return tokenOrder
    .map((token) => `${indent}--color-${token}: ${tokens[token]};`)
    .join("\n");
}

function createCss(engine: Engine, settings: ThemeSettings) {
  const light = createTokens("light", settings);
  const dark = createTokens("dark", settings);
  const radius = `${settings.radius}rem`;

  if (engine === "nativewind") {
    return `/* Moe UI theme — NativeWind */
@theme {
${tokenLines(light, "  ")}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
}

@layer theme {
  :root { --radius: ${radius}; }

  .dark {
${tokenLines(dark, "    ")}
  }
}`;
  }

  return `/* Moe UI theme — Uniwind */
@layer theme {
  :root {
    @variant light {
${tokenLines(light, "      ")}
    }

    @variant dark {
${tokenLines(dark, "      ")}
    }

    --radius: ${radius};
  }
}`;
}

function createPreviewStyle(tokens: ThemeTokens, radius: number): PreviewStyle {
  const style = { "--tg-radius": `${radius}rem` } as PreviewStyle;
  for (const token of tokenOrder) style[`--tg-${token}`] = tokens[token];
  return style;
}

export function ThemeGenerator() {
  const [settings, setSettings] = useState(defaultSettings);
  const [engine, setEngine] = useState<Engine>("uniwind");
  const [mode, setMode] = useState<PreviewMode>("light");
  const [view, setView] = useState<StudioView>("preview");
  const [copied, setCopied] = useState(false);
  const css = useMemo(() => createCss(engine, settings), [engine, settings]);
  const previewTokens = useMemo(
    () => createTokens(mode, settings),
    [mode, settings],
  );
  const previewStyle = useMemo(
    () => createPreviewStyle(previewTokens, settings.radius),
    [previewTokens, settings.radius],
  );

  function selectPreset(hue: number, chroma: number) {
    setSettings((current) => ({ ...current, hue, chroma }));
  }

  async function copyCss() {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function shuffleTheme() {
    const currentIndex = presets.findIndex(
      (preset) =>
        preset.hue === settings.hue && preset.chroma === settings.chroma,
    );
    const next = presets[(currentIndex + 1 + presets.length) % presets.length];
    setSettings((current) => ({
      ...current,
      hue: next.hue,
      chroma: next.chroma,
    }));
  }

  return (
    <section
      className="theme-generator theme-studio-v2"
      data-testid="theme-generator"
    >
      <header className="theme-studio-header">
        <div className="theme-studio-title">
          <span className="theme-studio-mark" aria-hidden>
            m
          </span>
          <div>
            <strong>Theme Studio</strong>
            <span>Build a theme for every Moe UI component</span>
          </div>
        </div>

        <fieldset className="theme-studio-view-tabs">
          <legend className="sr-only">Studio view</legend>
          <button
            type="button"
            aria-pressed={view === "preview"}
            data-active={view === "preview"}
            onClick={() => setView("preview")}
          >
            <LayoutGrid aria-hidden />
            Preview
          </button>
          <button
            type="button"
            aria-pressed={view === "code"}
            data-active={view === "code"}
            onClick={() => setView("code")}
          >
            <Code2 aria-hidden />
            Code
          </button>
        </fieldset>

        <div className="theme-studio-header-actions">
          <fieldset className="theme-studio-mode-switch">
            <legend className="sr-only">Preview theme</legend>
            <button
              type="button"
              aria-label="Light preview"
              aria-pressed={mode === "light"}
              data-active={mode === "light"}
              onClick={() => setMode("light")}
            >
              <Sun aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Dark preview"
              aria-pressed={mode === "dark"}
              data-active={mode === "dark"}
              onClick={() => setMode("dark")}
            >
              <Moon aria-hidden />
            </button>
          </fieldset>
          <button
            className="theme-studio-icon-button"
            type="button"
            aria-label="Reset theme"
            onClick={() => setSettings(defaultSettings)}
          >
            <RotateCcw aria-hidden />
          </button>
          <button
            className="theme-studio-code-button"
            type="button"
            onClick={() => setView("code")}
          >
            <Code2 aria-hidden />
            Get code
          </button>
        </div>
      </header>

      <div className="theme-studio-workspace">
        <aside className="theme-studio-controls" aria-label="Theme controls">
          <div className="theme-control-section">
            <span className="theme-control-label">Styling engine</span>
            <fieldset className="theme-studio-engine-tabs">
              <legend className="sr-only">Styling engine</legend>
              {(["uniwind", "nativewind"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={engine === item}
                  data-active={engine === item}
                  onClick={() => setEngine(item)}
                >
                  {item === "uniwind" ? "Uniwind" : "NativeWind"}
                </button>
              ))}
            </fieldset>
          </div>

          <fieldset className="theme-control-section">
            <legend className="theme-control-label">Base color</legend>
            <div className="theme-studio-presets">
              {presets.map((preset) => {
                const active =
                  preset.hue === settings.hue &&
                  preset.chroma === settings.chroma;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    aria-label={preset.name}
                    aria-pressed={active}
                    data-active={active}
                    onClick={() => selectPreset(preset.hue, preset.chroma)}
                  >
                    <span
                      style={{
                        background: oklch(0.62, preset.chroma, preset.hue),
                      }}
                    />
                    <small>{preset.name}</small>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="theme-control-section theme-studio-fine-tune">
            <span className="theme-control-label">Fine tune</span>
            <ThemeRange
              id="theme-hue"
              label="Hue"
              value={settings.hue}
              min={0}
              max={360}
              output={`${settings.hue}°`}
              className="theme-hue-range"
              onChange={(hue) =>
                setSettings((current) => ({ ...current, hue }))
              }
            />
            <ThemeRange
              id="theme-chroma"
              label="Saturation"
              value={settings.chroma}
              min={0.02}
              max={0.22}
              step={0.01}
              output={`${Math.round((settings.chroma / 0.22) * 100)}%`}
              onChange={(chroma) =>
                setSettings((current) => ({ ...current, chroma }))
              }
            />
          </div>

          <fieldset className="theme-control-section">
            <legend className="theme-control-label">Radius</legend>
            <div className="theme-studio-radius-list">
              {[0, 0.375, 0.625, 1].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  aria-pressed={settings.radius === radius}
                  data-active={settings.radius === radius}
                  onClick={() =>
                    setSettings((current) => ({ ...current, radius }))
                  }
                >
                  <span style={{ borderRadius: `${radius}rem` }} />
                  {radius === 0 ? "0" : radius}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="theme-control-section">
            <span className="theme-control-label">Semantic tokens</span>
            <div className="theme-studio-token-strip" style={previewStyle}>
              {[
                "background",
                "foreground",
                "primary",
                "secondary",
                "muted",
                "accent",
                "border",
              ].map((token) => (
                <span
                  key={token}
                  title={`--${token}`}
                  style={{ background: `var(--tg-${token})` }}
                />
              ))}
            </div>
          </div>

          <button
            className="theme-studio-shuffle"
            type="button"
            onClick={shuffleTheme}
          >
            <Sparkles aria-hidden />
            Shuffle palette
          </button>
        </aside>

        <main className="theme-studio-stage">
          {view === "preview" ? (
            <ThemePreview style={previewStyle} mode={mode} />
          ) : (
            <ThemeCode
              css={css}
              engine={engine}
              copied={copied}
              onCopy={copyCss}
            />
          )}
        </main>
      </div>

      <span className="sr-only" aria-live="polite">
        {copied ? "Theme CSS copied" : ""}
      </span>
    </section>
  );
}

function ThemeRange({
  id,
  label,
  value,
  min,
  max,
  step,
  output,
  className,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  output: string;
  className?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="theme-range-control">
      <div>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{output}</output>
      </div>
      <input
        id={id}
        className={className}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function ThemePreview({
  style,
  mode,
}: {
  style: PreviewStyle;
  mode: PreviewMode;
}) {
  return (
    <div className="theme-studio-preview" style={style} data-mode={mode}>
      <nav className="theme-demo-nav" aria-label="Preview navigation">
        <div className="theme-demo-brand">
          <span>m</span>
          <strong>Orbit</strong>
        </div>
        <div className="theme-demo-nav-links" aria-hidden>
          <span data-active>Overview</span>
          <span>Projects</span>
          <span>Team</span>
        </div>
        <button type="button" aria-label="Preview user menu">
          MK
        </button>
      </nav>

      <div className="theme-demo-canvas">
        <section className="theme-demo-intro">
          <div>
            <span className="theme-demo-kicker">Workspace overview</span>
            <h3>Design, ship, repeat.</h3>
            <p>A complete preview of your semantic theme across real UI.</p>
          </div>
          <div
            className="theme-demo-palette"
            role="img"
            aria-label="Theme token palette"
          >
            {[
              "background",
              "foreground",
              "primary",
              "secondary",
              "muted",
              "accent",
            ].map((token) => (
              <span key={token}>
                <i style={{ background: `var(--tg-${token})` }} />
                <small>--{token}</small>
              </span>
            ))}
          </div>
        </section>

        <div className="theme-demo-grid">
          <article className="theme-demo-panel theme-demo-controls-panel">
            <header>
              <div>
                <strong>Component states</strong>
                <span>Buttons, fields and selections</span>
              </div>
              <span className="theme-demo-status">Live</span>
            </header>
            <div className="theme-demo-buttons">
              <button type="button">Primary</button>
              <button type="button">Secondary</button>
              <button type="button">Outline</button>
              <button type="button">Ghost</button>
            </div>
            <label className="theme-demo-input">
              <span>Name</span>
              <input type="text" placeholder="Maya Kim" readOnly />
            </label>
            <label className="theme-demo-switch-row">
              <span>
                <strong>Product updates</strong>
                <small>Receive a weekly digest.</small>
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          </article>

          <article className="theme-demo-panel theme-demo-metric-panel">
            <header>
              <div>
                <strong>Weekly activity</strong>
                <span>Tasks completed</span>
              </div>
              <b>+18%</b>
            </header>
            <div
              className="theme-demo-chart"
              role="img"
              aria-label="Weekly activity chart"
            >
              {[42, 70, 50, 88, 62, 96, 76].map((height) => (
                <span key={height} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="theme-demo-chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </article>

          <article className="theme-demo-panel theme-demo-project-panel">
            <header>
              <div>
                <strong>Launch mobile app</strong>
                <span>12 contributors · Updated now</span>
              </div>
              <button type="button">Open</button>
            </header>
            <div className="theme-demo-progress">
              <span />
            </div>
            <footer>
              <div className="theme-demo-avatars">
                <span>MK</span>
                <span>JL</span>
                <span>AR</span>
              </div>
              <small>18 of 24 tasks</small>
            </footer>
          </article>

          <article className="theme-demo-panel theme-demo-invite-panel">
            <span className="theme-demo-icon">+</span>
            <div>
              <strong>Invite your team</strong>
              <span>Collaborate in one shared space.</span>
            </div>
            <button type="button">Send invite</button>
          </article>
        </div>
      </div>
    </div>
  );
}

function ThemeCode({
  css,
  engine,
  copied,
  onCopy,
}: {
  css: string;
  engine: Engine;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="theme-studio-code-view">
      <header>
        <div>
          <span className="theme-demo-kicker">Ready to use</span>
          <h3>Your {engine === "uniwind" ? "Uniwind" : "NativeWind"} theme</h3>
          <p>Replace the Moe UI theme block in your global CSS.</p>
        </div>
        <button type="button" onClick={onCopy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy CSS"}
        </button>
      </header>
      <pre>
        <code>{css}</code>
      </pre>
    </div>
  );
}
