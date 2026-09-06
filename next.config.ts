import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

// Next.js 16 defaults to Turbopack for both `next dev` and `next build`, but
// Turbopack does not support webpack plugins — and this plugin generates the
// service worker via a webpack plugin (workbox-webpack-plugin). So this only
// takes effect when the build actually runs on webpack, which is why `build`
// in package.json passes `--webpack` (the compiled output is then served
// as-is by `next start`, no flag needed there); `next dev` keeps using
// Turbopack as normal (the service worker is disabled in dev anyway, and
// Turbopack silently ignores a `webpack` config key it doesn't understand).
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // We register the service worker ourselves (components/sw-update-banner.tsx)
  // so we can show a confirmation banner instead of reloading silently.
  register: false,
  workboxOptions: {
    // Our own hand-written service worker (network-first with a cache
    // fallback) — this only injects the precache manifest into it, it does
    // not replace it with a generated one. See service-worker/sw.js.
    swSrc: "service-worker/sw.js",
  },
});

export default withPWA(nextConfig);
