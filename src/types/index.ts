export type TradeResult = 'win' | 'loss';

export interface Trade {
  id: number;
  amount: number;
  payout: number;
  result: TradeResult;
  profit_loss: number;
  created_at: string;
}

export interface Settings {
  initial_capital: number;
  default_payout: number;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalInvested: number;
  totalProfit: number;
  totalLoss: number;
  netProfitLoss: number;
  profitFactor: number;
  mathematicalExpectancy: number;
  maxWinStreak: number;
  maxLossStreak: number;
  currentStreak: number;
  currentStreakType: TradeResult | null;
  returnOnCapital: number;
  equityCurve: { date: string; balance: number }[];
  // Gestión de riesgo
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgRiskPercent: number;
  ruinRisk: number;
  // Muestra estadística
  isStatisticallyReliable: boolean;
  reliabilityLevel: 'insufficient' | 'low' | 'moderate' | 'high';
  // Payout promedio real sobre todas las operaciones del período
  avgPayout: number;
}