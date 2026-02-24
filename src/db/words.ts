import { getDb } from './init';

export function getWordsCount(): number {
  const database = getDb();
  const result = database.executeSync(
    'SELECT COUNT(*) as total FROM words'
  );
  const row = result.rows?.[0];
  return row && typeof row.total === 'number' ? row.total : 0;
}

export function getWordsPaginated(limit: number, offset: number): string[] {
  const database = getDb();
  const result = database.executeSync(
    'SELECT word FROM words ORDER BY word LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const rows = result.rows ?? [];
  return rows.map((r) => String(r.word));
}

export function searchWords(
  searchTerm: string,
  limit: number,
  offset: number
): string[] {
  const database = getDb();
  const term = `%${searchTerm.trim().toLowerCase()}%`;
  const result = database.executeSync(
    'SELECT word FROM words WHERE word LIKE ? ORDER BY word LIMIT ? OFFSET ?',
    [term, limit, offset]
  );
  const rows = result.rows ?? [];
  return rows.map((r) => String(r.word));
}

export function searchWordsCount(searchTerm: string): number {
  const database = getDb();
  const term = `%${searchTerm.trim().toLowerCase()}%`;
  const result = database.executeSync(
    'SELECT COUNT(*) as total FROM words WHERE word LIKE ?',
    [term]
  );
  const row = result.rows?.[0];
  return row && typeof row.total === 'number' ? row.total : 0;
}

export async function insertWordsBatch(words: string[]): Promise<void> {
  const database = getDb();
  const batchSize = 500;
  for (let i = 0; i < words.length; i += batchSize) {
    const chunk = words.slice(i, i + batchSize);
    const placeholders = chunk.map(() => '(?)').join(',');
    const values = chunk.map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (values.length === 0) continue;
    await database.execute(
      `INSERT OR IGNORE INTO words (word) VALUES ${placeholders}`,
      values
    );
  }
}
