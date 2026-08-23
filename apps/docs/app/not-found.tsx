import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-700">
        404 · Missing source
      </p>
      <h1 className="home-display mt-4 text-6xl tracking-tight">
        This component escaped the registry.
      </h1>
      <p className="mt-5 text-fd-muted-foreground">
        The requested page does not exist or moved before the beta was cut.
      </p>
      <Link
        href="/docs/components"
        className="mt-8 w-fit rounded-full bg-fd-foreground px-5 py-2.5 text-sm font-semibold text-fd-background"
      >
        Browse components
      </Link>
    </main>
  );
}
