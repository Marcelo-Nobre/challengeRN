import type { DictionaryEntry } from '../api/types';
import { getDb } from './init';

export function getCachedWordDetails(word: string): DictionaryEntry[] | null {
  const database = getDb();
  const w = word.trim().toLowerCase();
  if (!w) return null;
  const result = database.executeSync(
    'SELECT data FROM word_cache WHERE word = ? LIMIT 1',
    [w]
  );
  const row = result.rows?.[0];
  if (!row || typeof row.data !== 'string') return null;
  try {
    const parsed = JSON.parse(row.data) as DictionaryEntry[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setCachedWordDetails(
  word: string,
  data: DictionaryEntry[]
): void {
  const database = getDb();
  const w = word.trim().toLowerCase();
  if (!w || !Array.isArray(data) || data.length === 0) return;
  const json = JSON.stringify(data);
  database.executeSync(
    "INSERT OR REPLACE INTO word_cache (word, data, updated_at) VALUES (?, ?, strftime('%s', 'now'))",
    [w, json]
  );
}
