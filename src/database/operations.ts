import db from './database';
import { Trade, Settings } from '../types';

// ─── TRADES ───────────────────────────────────────────────

export const insertTrade = (
  amount: number,
  payout: number,
  result: 'win' | 'loss'
): void => {
  const profit_loss =
    result === 'win'
      ? amount * (payout / 100)
      : -amount;

  const created_at = new Date().toISOString();

  db.runSync(
    `INSERT INTO trades (amount, payout, result, profit_loss, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [amount, payout, result, profit_loss, created_at]
  );
};

export const getAllTrades = (): Trade[] => {
  return db.getAllSync<Trade>(
    `SELECT * FROM trades ORDER BY created_at DESC`
  );
};

export const getTradesByPeriod = (from: string, to: string): Trade[] => {
  return db.getAllSync<Trade>(
    `SELECT * FROM trades
     WHERE created_at >= ? AND created_at <= ?
     ORDER BY created_at DESC`,
    [from, to]
  );
};


export const updateTrade = (
  id: number,
  amount: number,
  payout: number,
  result: 'win' | 'loss'
): void => {
  const profit_loss =
    result === 'win'
      ? amount * (payout / 100)
      : -amount;

  db.runSync(
    `UPDATE trades
     SET amount = ?, payout = ?, result = ?, profit_loss = ?
     WHERE id = ?`,
    [amount, payout, result, profit_loss, id]
  );
};

export const deleteTrade = (id: number): void => {
  db.runSync(`DELETE FROM trades WHERE id = ?`, [id]);
};

// ─── SETTINGS ─────────────────────────────────────────────

export const getSettings = (): Settings => {
  return db.getFirstSync<Settings>(
    `SELECT initial_capital, default_payout FROM settings WHERE id = 1`
  ) as Settings;
};

export const updateSettings = (
  initial_capital: number,
  default_payout: number
): void => {
  db.runSync(
    `UPDATE settings
     SET initial_capital = ?, default_payout = ?
     WHERE id = 1`,
    [initial_capital, default_payout]
  );
};