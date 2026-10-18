import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-lg text-ink-2">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-accent px-5 py-2.5 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/docs/"
          className="rounded-lg border border-line px-5 py-2.5 text-base font-medium text-ink-2 transition-colors hover:border-line-2 hover:text-ink"
        >
          Browse docs
        </Link>
      </div>
    </div>
  );
}
