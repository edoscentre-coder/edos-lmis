"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

// Registers the service worker and — when a new version has installed and is
// sitting idle in the "waiting" state — shows a banner instead of reloading
// the page out from under whoever is mid-task. The refresh only happens once
// the user clicks, via the skipWaiting()/clientsClaim() pattern in
// service-worker/sw.js triggered by a postMessage from here.
export function SwUpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      if (registration.waiting) setWaitingWorker(registration.waiting);

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(installing);
          }
        });
      });
    }).catch(() => {});
  }, []);

  if (!waitingWorker) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-sm text-primary-foreground">
      <span>A new version of EDOS LMIS is ready.</span>
      <button
        type="button"
        onClick={() => waitingWorker.postMessage("SKIP_WAITING")}
        className="flex items-center gap-1 rounded border border-primary-foreground/40 px-2 py-1 font-medium hover:bg-primary-foreground/10"
      >
        <RefreshCw size={14} />
        Restart to update
      </button>
    </div>
  );
}
