import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">This college page could not be found</h1>
      <p className="mt-3 max-w-xl text-slate-500">
        The slug may be incorrect or the college is no longer available in the directory.
      </p>
      <Link href="/colleges" className="button-primary mt-6">
        Browse colleges
      </Link>
    </div>
  );
}
