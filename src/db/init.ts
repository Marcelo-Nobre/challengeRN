import { open, type DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'dictionary.db';

let db: DB | null = null;

export function getDb(): DB {
  if (!db) {
    db = open({ name: DB_NAME });
    createTables(db);
  }
  return db;
}

function createTables(database: DB): void {
  database.executeSync(
    'CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT UNIQUE NOT NULL)'
  );
  database.executeSync(
    'CREATE INDEX IF NOT EXISTS idx_words_word ON words(word)'
  );

  database.executeSync(
    'CREATE TABLE IF NOT EXISTS favorites (word TEXT PRIMARY KEY)'
  );

  database.executeSync(
    "CREATE TABLE IF NOT EXISTS word_cache (word TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER DEFAULT (strftime('%s', 'now')))"
  );
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
