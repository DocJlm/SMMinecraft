import { createClient } from '@vercel/kv';

function getKV() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  return createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

// In-memory store for development
const memoryStore: Record<string, unknown> = {};

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = getKV();
  if (kv) return kv.get<T>(key);
  return (memoryStore[key] as T) || null;
}

export async function kvSet(key: string, value: unknown, opts?: { ex?: number }) {
  const kv = getKV();
  if (kv) {
    if (opts?.ex) {
      await kv.set(key, value, { ex: opts.ex });
    } else {
      await kv.set(key, value);
    }
  } else {
    memoryStore[key] = value;
  }
}

export async function kvDel(key: string) {
  const kv = getKV();
  if (kv) await kv.del(key);
  else delete memoryStore[key];
}

export async function kvKeys(pattern: string): Promise<string[]> {
  const kv = getKV();
  if (kv) {
    const keys: string[] = [];
    let cursor = '0';
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await kv.scan(cursor, { match: pattern, count: 100 });
      cursor = String(result[0]);
      keys.push(...(result[1] as string[]));
    } while (cursor !== '0');
    return keys;
  }
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return Object.keys(memoryStore).filter((k) => regex.test(k));
}

export const KEYS = {
  user: (userId: string) => `user:${userId}`,
  player: (userId: string) => `player:${userId}`,
  playersPattern: () => 'player:*',
  conversation: (id: string) => `conv:${id}`,
  conversationsPattern: () => 'conv:*',
  inventory: (userId: string) => `inv:${userId}`,
  onlineCount: () => 'online:count',
};
