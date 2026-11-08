/**
 * Lưu trữ cục bộ dạng key-value. CHỈ trên thiết bị (CLAUDE.md A6).
 * Ưu tiên IndexedDB, dự phòng localStorage, cuối cùng là bộ nhớ tạm.
 * Không có bất kỳ lệnh gọi mạng nào.
 */

export interface KV {
  readonly kind: 'indexeddb' | 'localstorage' | 'memory';
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

const DB_NAME = 'happy-farm-english';
const STORE = 'kv';
const LS_PREFIX = 'hfe:';

export class MemoryKV implements KV {
  readonly kind = 'memory' as const;
  private map = new Map<string, string>();
  async get<T>(key: string): Promise<T | undefined> {
    const raw = this.map.get(key);
    return raw === undefined ? undefined : (JSON.parse(raw) as T);
  }
  async set<T>(key: string, value: T): Promise<void> {
    this.map.set(key, JSON.stringify(value));
  }
  async delete(key: string): Promise<void> {
    this.map.delete(key);
  }
}

class LocalStorageKV implements KV {
  readonly kind = 'localstorage' as const;
  async get<T>(key: string): Promise<T | undefined> {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }
  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  }
  async delete(key: string): Promise<void> {
    localStorage.removeItem(LS_PREFIX + key);
  }
}

class IndexedDbKV implements KV {
  readonly kind = 'indexeddb' as const;
  constructor(private db: IDBDatabase) {}

  private run<R>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  async get<T>(key: string): Promise<T | undefined> {
    return (await this.run('readonly', (s) => s.get(key))) as T | undefined;
  }
  async set<T>(key: string, value: T): Promise<void> {
    await this.run('readwrite', (s) => s.put(value, key));
  }
  async delete(key: string): Promise<void> {
    await this.run('readwrite', (s) => s.delete(key));
  }
}

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
}

function localStorageWorks(): boolean {
  try {
    const k = LS_PREFIX + '__probe';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export async function openKV(): Promise<KV> {
  try {
    if (typeof indexedDB !== 'undefined') {
      const db = await openIndexedDb();
      // Xin trình duyệt giữ dữ liệu lâu dài (không bắt buộc, không hỏi quyền người dùng ở đa số trình duyệt).
      void navigator.storage?.persist?.().catch(() => undefined);
      return new IndexedDbKV(db);
    }
  } catch {
    /* rơi xuống localStorage */
  }
  if (typeof localStorage !== 'undefined' && localStorageWorks()) return new LocalStorageKV();
  return new MemoryKV();
}

// ---------- Bản sao đồng bộ (SPEC 17.5) ----------
// IndexedDB ghi bất đồng bộ — khi trang bị đóng có thể không kịp. Bản sao nhỏ trong localStorage
// được ghi đồng bộ; lúc mở lại, nơi đọc so `savedAt` và chọn bản mới nhất.
const BACKUP_PREFIX = 'hfe:bk:';

export function writeBackup(key: string, value: unknown): void {
  try {
    localStorage.setItem(BACKUP_PREFIX + key, JSON.stringify(value));
  } catch {
    /* hết chỗ / bị chặn → bỏ qua, IndexedDB vẫn là nơi lưu chính */
  }
}

export function readBackup<T = unknown>(key: string): T | undefined {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(BACKUP_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
