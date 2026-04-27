import { authSocialButtonClass } from "@/components/auth/auth-form-classes";
import { siteConfig } from "@/lib/config/site";

export function SocialLoginButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <a
        href={`${siteConfig.apiUrl.replace(/\/api$/, "")}/api/users/oauth/google`}
        className={authSocialButtonClass}
      >
        Continue with Google
      </a>
      <a
        href={`${siteConfig.apiUrl.replace(/\/api$/, "")}/api/users/oauth/facebook`}
        className={authSocialButtonClass}
      >
        Continue with Facebook
      </a>
    </div>
  );
}
