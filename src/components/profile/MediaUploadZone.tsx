"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { ImageCropDialog } from "@/components/profile/ImageCropDialog";
import { ImagePreviewDialog } from "@/components/profile/ImagePreviewDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCroppedImageBlob } from "@/lib/cropImage";
import { type MediaKind, MediaUploadError, uploadPersonMedia } from "@/lib/mediaUpload";
import { cn } from "@/lib/utils";

import type { Person } from "@/types/session";
import type { Area } from "react-easy-crop";

// Avatars crop to a circle at 1:1; banners crop to a wide letterbox — both
// match how each is actually displayed (ProfileHeaderCard).
const ASPECT: Record<MediaKind, number> = { avatar: 1, banner: 4 };

export function MediaUploadZone({
  kind,
  currentImageUrl,
  onUploaded,
  rounded = false,
  className,
  children,
}: {
  kind: MediaKind;
  /** When set, clicking opens a preview (Change/Remove) instead of the file
   * picker directly — nothing to preview yet, so a first-time upload skips
   * straight to picking a file. */
  currentImageUrl?: string | null;
  onUploaded: (person: Person) => void;
  rounded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ file: File; objectUrl: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  function handleTriggerClick() {
    if (currentImageUrl) {
      setPreviewOpen(true);
    } else {
      inputRef.current?.click();
    }
  }

  function handleSelect(file: File) {
    setError(null);
    setPending({ file, objectUrl: URL.createObjectURL(file) });
  }

  function closeCrop() {
    if (pending) URL.revokeObjectURL(pending.objectUrl);
    setPending(null);
  }

  async function handleCropSave(crop: Area) {
    if (!pending) return;
    const { file, objectUrl } = pending;
    setPending(null);
    setUploading(true);
    try {
      const blob = await getCroppedImageBlob(objectUrl, crop, file.type);
      const cropped = new File([blob], file.name, { type: file.type });
      onUploaded(await uploadPersonMedia(kind, cropped));
    } catch (err) {
      setError(err instanceof MediaUploadError ? err.message : "Upload failed. Try again.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
    }
  }

  return (
    <div className={cn("group/media relative", className)}>
      {children}
      <Button
        type="button"
        variant="ghost"
        onClick={handleTriggerClick}
        disabled={uploading}
        aria-label={kind === "avatar" ? "Change profile picture" : "Change banner"}
        className={cn(
          "absolute inset-0 h-full w-full p-0 text-white opacity-0 transition-opacity",
          "hover:bg-black/40 hover:text-white group-hover/media:opacity-100 focus-visible:opacity-100",
          rounded && "rounded-full",
          uploading && "bg-black/40 opacity-100"
        )}
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
      </Button>
      <Input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) handleSelect(file);
        }}
      />
      {error && (
        <p className="absolute left-1/2 top-full z-10 mt-1 w-max max-w-48 -translate-x-1/2 text-center text-[10px] font-medium text-error">
          {error}
        </p>
      )}

      {previewOpen && currentImageUrl && (
        <ImagePreviewDialog
          kind={kind}
          imageUrl={currentImageUrl}
          onChangeImage={() => {
            setPreviewOpen(false);
            inputRef.current?.click();
          }}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {pending && (
        <ImageCropDialog
          imageSrc={pending.objectUrl}
          aspect={ASPECT[kind]}
          round={rounded}
          onCancel={closeCrop}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
