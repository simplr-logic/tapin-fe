"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/constants";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 12;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrolledSnapshot() {
  return window.scrollY > SCROLL_THRESHOLD_PX;
}

function getScrolledServerSnapshot() {
  return false;
}

export default function LandingHeader() {
  const scrolled = useSyncExternalStore(subscribe, getScrolledSnapshot, getScrolledServerSnapshot);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 shrink-0 self-start w-full border-b border-garden-border transition-[background-color,box-shadow] duration-[250ms] ease-[cubic-bezier(0.15,0.85,0.35,1)]",
        scrolled ? "bg-card shadow-elevated backdrop-blur-md" : "bg-canvas/95 backdrop-blur-sm"
      )}
    >
      <div
        className={cn(
          "max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between transition-[height] duration-[250ms] ease-[cubic-bezier(0.15,0.85,0.35,1)]",
          scrolled ? "h-12" : "h-16 md:h-[4.5rem]"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-2 py-2 -ml-2 min-h-11 hover:bg-surface-2 transition-colors duration-100"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={40}
            height={40}
            className={cn(
              "object-contain transition-[width,height] duration-[250ms]",
              scrolled ? "size-9" : "size-10 md:size-11"
            )}
          />
          <span
            className={cn(
              "font-semibold text-ink tracking-tight transition-[font-size] duration-[250ms]",
              scrolled ? "text-base" : "text-lg md:text-xl"
            )}
          >
            {APP_NAME}
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="#pricing"
            className={cn(
              "rounded-md px-3 py-2 min-h-11 inline-flex items-center font-medium text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors duration-100",
              scrolled ? "text-sm" : "text-sm md:text-base"
            )}
          >
            Pricing
          </Link>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className={cn(
              "rounded-md font-semibold uppercase tracking-wide",
              scrolled ? "h-9 min-w-11 px-4 text-xs" : "h-11 min-w-11 px-5 text-xs md:text-sm"
            )}
          >
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}
