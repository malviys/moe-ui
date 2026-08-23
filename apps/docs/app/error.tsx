"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-600">
        Render interrupted
      </p>
      <h1 className="home-display mt-4 text-6xl tracking-tight">
        The preview failed safely.
      </h1>
      <p className="mt-5 text-fd-muted-foreground">
        Try the render again. If it repeats, open an issue with the page URL.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 w-fit rounded-full bg-fd-foreground px-5 py-2.5 text-sm font-semibold text-fd-background"
      >
        Try again
      </button>
    </main>
  );
}
