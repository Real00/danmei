const DB_NAME = "danmei_cache";
const STORE_NAME = "chapters";
const DB_VERSION = 1;
// Cached entries expire after 7 days.
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedChapter {
  paragraphs: string[];
  cachedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function getCachedChapter(url: string): Promise<string[] | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(url);
      req.onsuccess = () => {
        const entry = req.result as CachedChapter | undefined;
        if (!entry) return resolve(null);
        if (Date.now() - entry.cachedAt > TTL_MS) return resolve(null);
        resolve(entry.paragraphs);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedChapter(url: string, paragraphs: string[]): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const entry: CachedChapter = { paragraphs, cachedAt: Date.now() };
      const req = tx.objectStore(STORE_NAME).put(entry, url);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore storage failures.
  }
}
