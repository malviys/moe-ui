"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ margin: "0 auto", maxWidth: 720, padding: "20vh 24px" }}>
          <p style={{ fontFamily: "monospace", textTransform: "uppercase" }}>
            Moe UI web beta
          </p>
          <h1>Documentation could not be rendered.</h1>
          <p>
            The failure is contained. Try once more, then report the page URL if
            it repeats.
          </p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
