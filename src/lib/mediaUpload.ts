import type { Person } from "@/types/session";

// Mirrors identity/internal/media/kind.go's MaxBytes + pkg/storage/image.go's
// allowedImageContentTypes on the gateway — checked client-side first so a
// too-big/wrong-type file fails instantly instead of round-tripping to
// /me/media/uploads only to be rejected there.
export type MediaKind = "avatar" | "banner";

const MAX_BYTES: Record<MediaKind, number> = {
  avatar: 2 * 1024 * 1024,
  banner: 5 * 1024 * 1024,
};

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class MediaUploadError extends Error {}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

// Reads the gateway's structured {error:{code,message}} body (same shape
// apperror.WriteHTTP writes for every non-2xx /me/* response) so failures
// like "media_object_invalid" (confirm's magic-byte/decode check failed) or
// "media_upload_expired" surface their real reason instead of a generic one.
async function errorMessage(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? fallback;
}

interface UploadInstructions {
  upload_id: string;
  upload_url: string;
  object_key: string;
  public_url: string;
  expires_at: string;
  required_headers: Record<string, string>;
}

// Three-step presigned upload against the real gateway (gateway/internal/handlers/me_media.go):
// initiate -> PUT bytes directly to storage -> confirm. Confirm returns the
// updated Person with the new avatar_url/banner_url already set.
export async function uploadPersonMedia(kind: MediaKind, file: File): Promise<Person> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new MediaUploadError("Use a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_BYTES[kind]) {
    throw new MediaUploadError(`Image is too large — max ${MAX_BYTES[kind] / (1024 * 1024)}MB.`);
  }

  const initiateRes = await fetch("/me/media/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, content_type: file.type, content_length: file.size }),
  });
  if (!initiateRes.ok) {
    throw new MediaUploadError(
      await errorMessage(initiateRes, "Couldn't start the upload. Try again.")
    );
  }
  const { upload } = (await initiateRes.json()) as { upload: UploadInstructions };

  const putRes = await fetch(upload.upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type, ...upload.required_headers },
    body: file,
  });
  if (!putRes.ok) {
    throw new MediaUploadError("Upload failed. Try again.");
  }

  const confirmRes = await fetch("/me/media/uploads/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload_id: upload.upload_id, object_key: upload.object_key }),
  });
  if (!confirmRes.ok) {
    throw new MediaUploadError(
      await errorMessage(confirmRes, "Couldn't save the image. Try again.")
    );
  }
  const body = (await confirmRes.json()) as { person: Person };
  return body.person;
}
