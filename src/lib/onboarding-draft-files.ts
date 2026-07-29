const DATABASE_NAME = "inkora-onboarding-drafts";
const DATABASE_VERSION = 1;
const FILE_STORE = "files";

export type OnboardingDraftArtistPhotos = {
  current: File | null;
  artists: Array<File | null>;
};

const memoryFallback = new Map<string, File | OnboardingDraftArtistPhotos>();

function logoKey(userId: string) {
  return `logo:${encodeURIComponent(userId)}`;
}

function artistPhotosKey(userId: string) {
  return `artist-photos:${encodeURIComponent(userId)}`;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB indisponível."));
      return;
    }

    const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(FILE_STORE)) {
        database.createObjectStore(FILE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir o rascunho da logo."));
    request.onblocked = () => reject(new Error("O rascunho da logo está bloqueado por outra aba."));
  });
}

async function writeStoredFile(key: string, file: File | null) {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE, "readwrite");
    const store = transaction.objectStore(FILE_STORE);
    if (file) store.put(file, key);
    else store.delete(key);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível salvar o rascunho da logo."));
    transaction.onabort = () => reject(transaction.error ?? new Error("O salvamento do rascunho da logo foi cancelado."));
  }).finally(() => database.close());
}

async function readStoredFile(key: string) {
  const database = await openDatabase();

  return new Promise<File | null>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE, "readonly");
    const request = transaction.objectStore(FILE_STORE).get(key);
    request.onsuccess = () => resolve(request.result instanceof File ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível restaurar o rascunho da logo."));
    transaction.onabort = () => reject(transaction.error ?? new Error("A restauração do rascunho da logo foi cancelada."));
  }).finally(() => database.close());
}

export async function saveOnboardingDraftLogo(userId: string, file: File | null) {
  const key = logoKey(userId);
  if (file) memoryFallback.set(key, file);
  else memoryFallback.delete(key);

  try {
    await writeStoredFile(key, file);
  } catch {
    // The in-memory fallback still preserves the file while this app session remains open.
  }
}

export async function restoreOnboardingDraftLogo(userId: string) {
  const key = logoKey(userId);

  try {
    const file = await readStoredFile(key);
    if (file) memoryFallback.set(key, file);
    const fallback = memoryFallback.get(key);
    return file ?? (fallback instanceof File ? fallback : null);
  } catch {
    const fallback = memoryFallback.get(key);
    return fallback instanceof File ? fallback : null;
  }
}

export async function clearOnboardingDraftLogo(userId: string) {
  const key = logoKey(userId);
  memoryFallback.delete(key);

  try {
    await writeStoredFile(key, null);
  } catch {
    // Clearing browser storage is best-effort and must not block a completed onboarding.
  }
}

function normalizeArtistPhotos(value: unknown): OnboardingDraftArtistPhotos {
  if (!value || typeof value !== "object") return { current: null, artists: [] };

  const candidate = value as { current?: unknown; artists?: unknown };
  return {
    current: candidate.current instanceof File ? candidate.current : null,
    artists: Array.isArray(candidate.artists)
      ? candidate.artists.map((photo) => (photo instanceof File ? photo : null))
      : [],
  };
}

async function writeArtistPhotos(key: string, photos: OnboardingDraftArtistPhotos) {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE, "readwrite");
    const store = transaction.objectStore(FILE_STORE);
    const hasPhoto = Boolean(photos.current) || photos.artists.some(Boolean);
    if (hasPhoto) store.put(photos, key);
    else store.delete(key);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível salvar fotos dos tatuadores."));
    transaction.onabort = () => reject(transaction.error ?? new Error("O salvamento das fotos dos tatuadores foi cancelado."));
  }).finally(() => database.close());
}

async function readArtistPhotos(key: string): Promise<OnboardingDraftArtistPhotos> {
  const database = await openDatabase();

  return new Promise<OnboardingDraftArtistPhotos>((resolve, reject) => {
    const transaction = database.transaction(FILE_STORE, "readonly");
    const request = transaction.objectStore(FILE_STORE).get(key);
    request.onsuccess = () => resolve(normalizeArtistPhotos(request.result));
    request.onerror = () => reject(request.error ?? new Error("Não foi possível restaurar fotos dos tatuadores."));
    transaction.onabort = () => reject(transaction.error ?? new Error("A restauração das fotos dos tatuadores foi cancelada."));
  }).finally(() => database.close());
}

export async function saveOnboardingDraftArtistPhotos(userId: string, photos: OnboardingDraftArtistPhotos) {
  const key = artistPhotosKey(userId);
  const normalized = normalizeArtistPhotos(photos);
  if (normalized.current || normalized.artists.some(Boolean)) memoryFallback.set(key, normalized);
  else memoryFallback.delete(key);

  try {
    await writeArtistPhotos(key, normalized);
  } catch {
    // The in-memory fallback still preserves the files while this app session remains open.
  }
}

export async function restoreOnboardingDraftArtistPhotos(userId: string) {
  const key = artistPhotosKey(userId);

  try {
    const photos = await readArtistPhotos(key);
    if (photos.current || photos.artists.some(Boolean)) memoryFallback.set(key, photos);
    const fallback = memoryFallback.get(key);
    return photos.current || photos.artists.some(Boolean)
      ? photos
      : normalizeArtistPhotos(fallback);
  } catch {
    return normalizeArtistPhotos(memoryFallback.get(key));
  }
}

export async function clearOnboardingDraftArtistPhotos(userId: string) {
  const key = artistPhotosKey(userId);
  memoryFallback.delete(key);

  try {
    await writeArtistPhotos(key, { current: null, artists: [] });
  } catch {
    // Clearing browser storage is best-effort and must not block a completed onboarding.
  }
}
