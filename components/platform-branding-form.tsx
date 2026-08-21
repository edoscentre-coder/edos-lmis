"use client";

import { useActionState } from "react";
import { uploadAppLogo, clearAppLogo } from "@/lib/actions/platform-branding";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlatformBrandingForm({ appLogoUrl }: { appLogoUrl: string | null }) {
  const [uploadState, uploadAction, uploading] = useActionState(uploadAppLogo, null);
  const [clearState, clearAction, clearing] = useActionState(clearAppLogo, null);

  const error = uploadState?.error ?? clearState?.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          The EDOS mark shown in the sidebar, the mobile menu, and on the login page. It applies to every
          tenant across the platform. This is separate from a clinic&apos;s own logo under Settings, which is
          the one printed on their invoices and reports.
        </p>

        {appLogoUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            {/* Checkerboard-free neutral panel: the logo is likely transparent,
                and needs to read against both the light and dark chrome. */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={appLogoUrl} alt="Application logo" className="h-12 w-12 object-contain" />
              <span className="text-xs text-muted-foreground">Current logo</span>
            </div>
            <form action={clearAction}>
              <Button type="submit" variant="outline" disabled={clearing}>
                {clearing ? "Removing..." : "Remove"}
              </Button>
            </form>
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
            No logo uploaded — the built-in flask icon is being used.
          </p>
        )}

        <form action={uploadAction} className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 sm:flex-none">
            <Label htmlFor="app_logo">Upload new logo</Label>
            <Input
              id="app_logo"
              name="app_logo"
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              className="h-10"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              SVG, PNG, JPEG, or WEBP — up to 4MB. A square, transparent SVG or PNG of at least 256px looks
              sharpest, since it renders as small as 32px in the sidebar.
            </p>
          </div>
          <Button type="submit" variant="secondary" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>

        {error && <p className="text-sm text-critical">{error}</p>}
      </CardContent>
    </Card>
  );
}
