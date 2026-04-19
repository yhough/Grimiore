import Database from 'better-sqlite3'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'grimoire.db')

declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined
}

function createDb(): Database.Database {
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS worlds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      genre TEXT NOT NULL,
      premise TEXT,
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lore_entries (
      id TEXT PRIMARY KEY,
      world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('character','faction','location','history','misc')),
      name TEXT NOT NULL,
      summary TEXT,
      data TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ripple_cards (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
      world_id TEXT NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','dismissed')),
      created_at INTEGER NOT NULL
    );
  `)

  return sqlite
}

export const db = globalThis.__db ?? (globalThis.__db = createDb())
