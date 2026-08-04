"use client";

import { Camera, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import type { MediaKind } from "@/lib/mediaUpload";

export function ImagePreviewDialog({
  kind,
  imageUrl,
  onChangeImage,
  onClose,
}: {
  kind: MediaKind;
  imageUrl: string;
  onChangeImage: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{kind === "avatar" ? "Profile picture" : "Banner"}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "overflow-hidden bg-surface-2",
            kind === "avatar" ? "mx-auto h-48 w-48 rounded-full" : "h-32 w-full rounded-md"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- remote, user-uploaded object-storage URL, not a static asset next/image can optimize */}
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled
            title="Removing an image isn't supported yet"
            className="text-error gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove image
          </Button>
          <Button type="button" onClick={onChangeImage} className="gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Change image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
