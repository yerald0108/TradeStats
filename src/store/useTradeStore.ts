import { create } from 'zustand';
import { Trade, Settings, TradeStats } from '../types';
import {
  getAllTrades,
  getTradesByPeriod,
  insertTrade,
  updateTrade,
  deleteTrade,
  getSettings,
  updateSettings,
} from '../database/operations';
import { calculateStats } from '../utils/calculations';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';

const PAGE_SIZE = 20;

// Estado vacío reutilizable — evita duplicar el objeto en varios lugares
const EMPTY_STATS: TradeStats = {
  totalTrades: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  totalInvested: 0,
  totalProfit: 0,
  totalLoss: 0,
  netProfitLoss: 0,
  profitFactor: 0,
  mathematicalExpectancy: 0,
  maxWinStreak: 0,
  maxLossStreak: 0,
  currentStreak: 0,
  currentStreakType: null,
  returnOnCapital: 0,
  equityCurve: [],
  maxDrawdown: 0,
  maxDrawdownPercent: 0,
  avgRiskPercent: 0,
  ruinRisk: 0,
  isStatisticallyReliable: false,
  reliabilityLevel: 'insufficient',
  avgPayout: 0,
};

interface TradeStore {
  // ─── Configuración ───────────────────────────────────────
  settings: Settings;

  // ─── Contexto Dashboard (siempre all-time) ────────────────
  // El Dashboard nunca debe verse afectado por el filtro de período
  // que el usuario seleccione en Historial o Estadísticas.
  dashboardStats: TradeStats;
  recentTrades: Trade[]; // últimas 5 operaciones para el preview

  // ─── Contexto filtrado (History + Stats) ─────────────────
  trades: Trade[];
  stats: TradeStats;
  periodFilter: PeriodFilter;
  historyPage: number;
  isLoading: boolean;

  // ─── Acciones ─────────────────────────────────────────────
  loadDashboard: () => void;
  loadAll: () => void;
  loadSettings: () => void;
  addTrade: (amount: number, payout: number, result: 'win' | 'loss') => void;
  editTrade: (id: number, amount: number, payout: number, result: 'win' | 'loss') => void;
  removeTrade: (id: number) => void;
  saveSettings: (initial_capital: number, default_payout: number) => void;
  setPeriodFilter: (period: PeriodFilter) => void;
  loadMoreTrades: () => void;
}

const getPeriodDates = (period: PeriodFilter): { from: string; to: string } => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);

  if (period === 'today') {
    from.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
  }

  return { from: from.toISOString(), to: to.toISOString() };
};

export const useTradeStore = create<TradeStore>((set, get) => ({
  settings: { initial_capital: 0, default_payout: 85 },

  // Dashboard — inicializa vacío, se rellena en loadDashboard
  dashboardStats: EMPTY_STATS,
  recentTrades: [],

  // Filtrado — inicializa vacío, se rellena en loadAll
  trades: [],
  stats: EMPTY_STATS,
  periodFilter: 'today',
  historyPage: 1,
  isLoading: false,

  // ─── loadDashboard ────────────────────────────────────────
  // Siempre carga TODAS las operaciones sin importar el periodFilter.
  // Solo debe llamarse desde DashboardScreen.
  loadDashboard: () => {
    const { settings } = get();
    const allTrades = getAllTrades();
    const dashboardStats = calculateStats(allTrades, settings.initial_capital);
    // getAllTrades retorna DESC → slice(0,5) da las 5 más recientes
    const recentTrades = allTrades.slice(0, 5);
    set({ dashboardStats, recentTrades });
  },

  // ─── loadAll ──────────────────────────────────────────────
  // Carga operaciones según el periodFilter actual.
  // Solo debe llamarse desde HistoryScreen y StatsScreen.
  loadAll: () => {
    const { periodFilter, settings, historyPage } = get();
    set({ isLoading: true });

    let allTrades: Trade[];

    if (periodFilter === 'all') {
      allTrades = getAllTrades();
    } else {
      const { from, to } = getPeriodDates(periodFilter);
      allTrades = getTradesByPeriod(from, to);
    }

    const stats = calculateStats(allTrades, settings.initial_capital);
    // trades expone la página actual; stats refleja el período completo
    const trades = allTrades.slice(0, historyPage * PAGE_SIZE);

    set({ trades, stats, isLoading: false });
  },

  loadSettings: () => {
    const settings = getSettings();
    set({ settings });
  },

  addTrade: (amount, payout, result) => {
    insertTrade(amount, payout, result);
    set({ historyPage: 1 });
    // Refrescar ambos contextos: la mutación afecta a Dashboard y al filtrado
    get().loadDashboard();
    get().loadAll();
  },

  editTrade: (id, amount, payout, result) => {
    updateTrade(id, amount, payout, result);
    get().loadDashboard();
    get().loadAll();
  },

  removeTrade: (id) => {
    deleteTrade(id);
    get().loadDashboard();
    get().loadAll();
  },

  saveSettings: (initial_capital, default_payout) => {
    updateSettings(initial_capital, default_payout);
    const settings = getSettings();
    set({ settings });
    // Las métricas de riesgo dependen del capital → refrescar ambos contextos
    get().loadDashboard();
    get().loadAll();
  },

  setPeriodFilter: (period) => {
    set({ periodFilter: period, historyPage: 1 });
    get().loadAll();
  },

  // Bug fix #4: captura newPage antes del set para garantizar
  // que loadAll siempre lee el valor incrementado, no el anterior.
  loadMoreTrades: () => {
    const newPage = get().historyPage + 1;
    set({ historyPage: newPage });
    get().loadAll();
  },
}));