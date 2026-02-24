import { getDb } from './init';

export function addFavorite(word: string): void {
  const database = getDb();
  const w = word.trim().toLowerCase();
  if (!w) return;
  database.executeSync(
    'INSERT OR REPLACE INTO favorites (word) VALUES (?)',
    [w]
  );
}

export function removeFavorite(word: string): void {
  const database = getDb();
  database.executeSync('DELETE FROM favorites WHERE word = ?', [
    word.trim().toLowerCase(),
  ]);
}

export function isFavorite(word: string): boolean {
  const database = getDb();
  const result = database.executeSync(
    'SELECT 1 FROM favorites WHERE word = ? LIMIT 1',
    [word.trim().toLowerCase()]
  );
  return (result.rows?.length ?? 0) > 0;
}

export function getFavorites(): string[] {
  const database = getDb();
  const result = database.executeSync(
    'SELECT word FROM favorites ORDER BY word'
  );
  const rows = result.rows ?? [];
  return rows.map((r) => String(r.word));
}
