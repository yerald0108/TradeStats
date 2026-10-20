import db from './database';
import { Trade, Settings } from '../types';

// ─── TRADES ───────────────────────────────────────────────

export const insertTrade = (
  amount: number,
  payout: number,
  result: 'win' | 'loss'
): { success: boolean; error?: string } => {
  try {
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

    return { success: true };
  } catch (e) {
    console.error('[insertTrade]', e);
    return { success: false, error: 'No se pudo registrar la operación.' };
  }
};

export const getAllTrades = (): Trade[] => {
  try {
    return db.getAllSync<Trade>(
      `SELECT * FROM trades ORDER BY created_at DESC`
    );
  } catch (e) {
    console.error('[getAllTrades]', e);
    return [];
  }
};

export const getTradesByPeriod = (from: string, to: string): Trade[] => {
  try {
    return db.getAllSync<Trade>(
      `SELECT * FROM trades
       WHERE created_at >= ? AND created_at <= ?
       ORDER BY created_at DESC`,
      [from, to]
    );
  } catch (e) {
    console.error('[getTradesByPeriod]', e);
    return [];
  }
};

export const updateTrade = (
  id: number,
  amount: number,
  payout: number,
  result: 'win' | 'loss'
): { success: boolean; error?: string } => {
  try {
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

    return { success: true };
  } catch (e) {
    console.error('[updateTrade]', e);
    return { success: false, error: 'No se pudo editar la operación.' };
  }
};

export const deleteTrade = (
  id: number
): { success: boolean; error?: string } => {
  try {
    db.runSync(`DELETE FROM trades WHERE id = ?`, [id]);
    return { success: true };
  } catch (e) {
    console.error('[deleteTrade]', e);
    return { success: false, error: 'No se pudo eliminar la operación.' };
  }
};

// ─── SETTINGS ─────────────────────────────────────────────

export const getSettings = (): Settings => {
  try {
    return db.getFirstSync<Settings>(
      `SELECT initial_capital, default_payout FROM settings WHERE id = 1`
    ) as Settings;
  } catch (e) {
    console.error('[getSettings]', e);
    return { initial_capital: 0, default_payout: 85 };
  }
};

export const updateSettings = (
  initial_capital: number,
  default_payout: number
): { success: boolean; error?: string } => {
  try {
    db.runSync(
      `UPDATE settings
       SET initial_capital = ?, default_payout = ?
       WHERE id = 1`,
      [initial_capital, default_payout]
    );
    return { success: true };
  } catch (e) {
    console.error('[updateSettings]', e);
    return { success: false, error: 'No se pudo guardar la configuración.' };
  }
};