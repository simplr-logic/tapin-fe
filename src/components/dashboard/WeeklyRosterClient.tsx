"use client";

import dynamic from "next/dynamic";

// dnd-kit assigns internal ids (aria-describedby, etc.) via a client-side counter
// that doesn't line up with the server-rendered HTML, causing a hydration mismatch.
// Rendering client-only sidesteps that entirely — this panel is fully interactive
// and has no SEO value, so there's no SSR benefit lost.
const WeeklyRoster = dynamic(() => import("./WeeklyRoster"), { ssr: false });

export default WeeklyRoster;
