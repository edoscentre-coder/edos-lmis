import { LoginForm } from "@/components/login-form";
import { getPlatformBranding } from "@/lib/data/platform-branding";

// Server component so the platform logo can be read before render. The row and
// its storage bucket are both world-readable, which is what lets this work
// with no session.
export default async function LoginPage() {
  const { appLogoUrl } = await getPlatformBranding();

  return <LoginForm appLogoUrl={appLogoUrl} />;
}
