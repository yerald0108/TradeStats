import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('tradestats.db');

export const initDatabase = (): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      payout REAL NOT NULL,
      result TEXT NOT NULL,
      profit_loss REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      initial_capital REAL NOT NULL DEFAULT 0,
      default_payout REAL NOT NULL DEFAULT 85
    );
  `);

  db.execSync(`
    INSERT OR IGNORE INTO settings (id, initial_capital, default_payout)
    VALUES (1, 0, 85);
  `);
};

export default db;