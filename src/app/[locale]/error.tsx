"use client";

type LocaleErrorProps = {
  error: Error;
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Something went wrong</h1>
      <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
        {error.message || "An unexpected error happened while loading this page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        Try Again
      </button>
    </main>
  );
}
