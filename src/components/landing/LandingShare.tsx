"use client";

import { Share2 } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";

import {
  CheckIcon,
  CopyLinkIcon,
  FacebookIcon,
  LineIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/landing/SharePlatformIcons";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/constants";
import { cn } from "@/lib/utils";

const SHARE_TEXT = `${APP_NAME} — Time tracking that fits in a tap.`;

type ShareIcon = React.ComponentType<{ className?: string }>;

type SharePlatform = {
  id: string;
  label: string;
  icon: ShareIcon;
  iconClassName: string;
  buildUrl: (pageUrl: string) => string;
  className?: string;
};

const SHARE_PLATFORMS: SharePlatform[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: WhatsAppIcon,
    iconClassName: "text-[#25D366]",
    buildUrl: (pageUrl) => {
      const message = `${SHARE_TEXT} ${pageUrl}`;
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
    },
    className: "hover:border-[#25D366]/40 hover:bg-[#25D366]/8",
  },
  {
    id: "line",
    label: "LINE",
    icon: LineIcon,
    iconClassName: "text-[#06C755]",
    buildUrl: (pageUrl) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}`,
    className: "hover:border-[#06C755]/40 hover:bg-[#06C755]/8",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: FacebookIcon,
    iconClassName: "text-[#1877F2]",
    buildUrl: (pageUrl) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    className: "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/8",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: TelegramIcon,
    iconClassName: "text-[#26A5E4]",
    buildUrl: (pageUrl) =>
      `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(SHARE_TEXT)}`,
    className: "hover:border-[#26A5E4]/40 hover:bg-[#26A5E4]/8",
  },
  {
    id: "x",
    label: "X",
    icon: XIcon,
    iconClassName: "text-[#0F1419]",
    buildUrl: (pageUrl) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(SHARE_TEXT)}`,
    className: "hover:border-ink/30 hover:bg-surface-2",
  },
];

function subscribePageUrl(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function getPageUrlSnapshot() {
  return window.location.href;
}

function getPageUrlServerSnapshot() {
  return "";
}

function getShareSupportedSnapshot() {
  return typeof navigator.share === "function";
}

function getShareSupportedServerSnapshot() {
  return false;
}

export default function LandingShare() {
  const pageUrl = useSyncExternalStore(
    subscribePageUrl,
    getPageUrlSnapshot,
    getPageUrlServerSnapshot
  );
  const shareSupported = useSyncExternalStore(
    () => () => {},
    getShareSupportedSnapshot,
    getShareSupportedServerSnapshot
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const handleNativeShare = useCallback(async () => {
    if (!pageUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: `${APP_NAME} — Time tracking, without the timesheet dread`,
        text: SHARE_TEXT,
        url: pageUrl,
      });
    } catch {
      // User dismissed the share sheet.
    }
  }, [pageUrl]);

  const handleCopyLink = useCallback(async () => {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked.
    }
  }, [pageUrl]);

  const canShare = Boolean(pageUrl);

  return (
    <section
      className="relative border-t border-garden-border bg-card px-4 md:px-6 py-12 md:py-14"
      aria-labelledby="landing-share-heading"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2
          id="landing-share-heading"
          className="text-xl md:text-2xl font-bold text-ink tracking-tight text-balance"
        >
          Share {APP_NAME}
        </h2>
        <p className="mt-2 text-sm text-ink-muted text-balance">
          Know a team still fighting spreadsheets? Send them the link.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={!canShare || !shareSupported}
            onClick={handleNativeShare}
            className="size-11 rounded-md p-0 hover:border-link/40 hover:bg-link/5"
            aria-label="Share with device menu"
            title="Share"
          >
            <Share2 className="size-5 text-link" aria-hidden />
          </Button>

          {SHARE_PLATFORMS.map(({ id, label, icon: Icon, iconClassName, buildUrl, className }) => (
            <Button
              key={id}
              render={
                <a
                  href={canShare ? buildUrl(pageUrl) : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${label}`}
                  title={label}
                  aria-disabled={!canShare}
                  tabIndex={canShare ? 0 : -1}
                  onClick={(event) => {
                    if (!canShare) event.preventDefault();
                  }}
                />
              }
              nativeButton={false}
              variant="outline"
              disabled={!canShare}
              className={cn("size-11 rounded-md p-0", className)}
            >
              <Icon className={cn("size-5", iconClassName)} />
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={!canShare}
            onClick={handleCopyLink}
            className="size-11 rounded-md p-0 hover:border-link/40 hover:bg-link/5"
            aria-label="Copy link"
            title="Copy link"
          >
            {copiedLink ? (
              <CheckIcon className="size-5 text-success" />
            ) : (
              <CopyLinkIcon className="size-5 text-link" />
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
