import { siteConfig } from "@/lib/config/site";

export function SocialLoginButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <a
        href={`${siteConfig.apiUrl.replace(/\/api$/, "")}/api/users/oauth/google`}
        className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
      >
        Continue with Google
      </a>
      <a
        href={`${siteConfig.apiUrl.replace(/\/api$/, "")}/api/users/oauth/facebook`}
        className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"
      >
        Continue with Facebook
      </a>
    </div>
  );
}
