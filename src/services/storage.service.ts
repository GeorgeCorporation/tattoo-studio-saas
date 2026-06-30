export type PublicBucket = "artists" | "booking-references" | "client-deliveries" | "gallery" | "logos";

export function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

export function createStoragePath(studioId: string, fileName: string, parts: string[] = []) {
  const cleanParts = [studioId, ...parts].filter(Boolean);
  return `${cleanParts.join("/")}/${Date.now()}_${safeFileName(fileName)}`;
}

export function createBookingReferencePath(studioId: string, appointmentId: string, fileName: string) {
  return createStoragePath(studioId, fileName, [appointmentId]);
}

export function getStoragePathFromPublicUrl(url: string, bucket: PublicBucket) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const [, path] = url.split(marker);
  return path ? decodeURIComponent(path) : null;
}
