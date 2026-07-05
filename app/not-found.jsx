import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="finance-card p-8">
        <h1 className="text-6xl font-extrabold text-[#695CF6]">404</h1>
        <h2 className="mt-4 text-2xl font-extrabold text-[#0F172A]">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm font-medium leading-6 text-[#64748B]">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#13B8B5] px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(19,184,181,0.2)] transition hover:bg-[#0EA5A4]"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
