import { Trade, TradeStats } from '../types';

// Nivel de confianza estadística según número de operaciones
const getReliabilityLevel = (
  totalTrades: number
): TradeStats['reliabilityLevel'] => {
  if (totalTrades < 30) return 'insufficient';
  if (totalTrades < 60) return 'low';
  if (totalTrades < 100) return 'moderate';
  return 'high';
};

// Riesgo de ruina — fórmula clásica corregida
// Usa % del capital actual en cada operación, no del inicial
const calculateRuinRisk = (
  winRate: number,
  payout: number,
  avgRiskPercent: number
): number => {
  if (avgRiskPercent <= 0 || winRate <= 0 || winRate >= 100) return 0;

  const w = winRate / 100;
  const q = 1 - w;
  const b = payout / 100;

  // Edge = expectativa por unidad arriesgada
  const edge = w * b - q;

  // Sin edge positivo la ruina es inevitable a largo plazo
  if (edge <= 0) return 100;

  const riskFraction = avgRiskPercent / 100;
  const exponent = 1 / riskFraction;
  const base = (1 - edge) / (1 + edge);
  const ruinRisk = Math.pow(base, exponent) * 100;

  return Math.min(ruinRisk, 100);
};

// Drawdown máximo — corregido para calcular absoluto y porcentual por separado
const calculateMaxDrawdown = (
  equityCurve: { date: string; balance: number }[]
): { maxDrawdown: number; maxDrawdownPercent: number } => {
  if (equityCurve.length < 2) return { maxDrawdown: 0, maxDrawdownPercent: 0 };

  let peak = equityCurve[0].balance;
  let maxDrawdownAbs = 0;
  let maxDrawdownPct = 0;

  for (const point of equityCurve) {
    if (point.balance > peak) peak = point.balance;

    const ddAbs = peak - point.balance;
    const ddPct = peak > 0 ? (ddAbs / peak) * 100 : 0;

    // Se calculan por separado — no necesariamente ocurren en el mismo punto
    if (ddAbs > maxDrawdownAbs) maxDrawdownAbs = ddAbs;
    if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;
  }

  return { maxDrawdown: maxDrawdownAbs, maxDrawdownPercent: maxDrawdownPct };
};

export const calculateStats = (
  trades: Trade[],
  initialCapital: number
): TradeStats => {
  const totalTrades = trades.length;

  const emptyStats: TradeStats = {
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

  if (totalTrades === 0) return emptyStats;

  // Ordenar por fecha ascendente
  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let wins = 0;
  let losses = 0;
  let totalInvested = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  // Para riesgo de ruina: % respecto al capital ACTUAL en cada operación
  let runningBalance = initialCapital;
  let totalRiskPercent = 0;
  let riskTradeCount = 0;

  // Curva de equity
  const equityCurve: { date: string; balance: number }[] = [];

  if (initialCapital > 0) {
    equityCurve.push({ date: sorted[0].created_at, balance: initialCapital });
  }

  for (const trade of sorted) {
    totalInvested += trade.amount;

    // Riesgo respecto al capital actual, no al inicial
    if (runningBalance > 0) {
      totalRiskPercent += (trade.amount / runningBalance) * 100;
      riskTradeCount++;
    }

    if (trade.result === 'win') {
      wins++;
      totalProfit += trade.profit_loss;
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else {
      losses++;
      totalLoss += Math.abs(trade.profit_loss);
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    }

    runningBalance += trade.profit_loss;
    equityCurve.push({ date: trade.created_at, balance: runningBalance });
  }

  const winRate = (wins / totalTrades) * 100;
  const netProfitLoss = totalProfit - totalLoss;

  // profitFactor — Infinity es correcto matemáticamente, se maneja en la UI
  const profitFactor =
    totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

  const avgWin = wins > 0 ? totalProfit / wins : 0;
  const avgLoss = losses > 0 ? totalLoss / losses : 0;
  const winRateDecimal = wins / totalTrades;
  const lossRateDecimal = losses / totalTrades;
  const mathematicalExpectancy =
    winRateDecimal * avgWin - lossRateDecimal * avgLoss;

  // Racha actual — calculada en el mismo loop de abajo
  const lastTrade = sorted[sorted.length - 1];
  let currentStreak = 0;
  const currentStreakType: 'win' | 'loss' = lastTrade.result;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].result === currentStreakType) {
      currentStreak++;
    } else {
      break;
    }
  }

  const returnOnCapital =
    initialCapital > 0 ? (netProfitLoss / initialCapital) * 100 : 0;

  // Gestión de riesgo
  const { maxDrawdown, maxDrawdownPercent } = calculateMaxDrawdown(equityCurve);

  // Promedio de riesgo respecto al capital actual
  const avgRiskPercent =
    riskTradeCount > 0 ? totalRiskPercent / riskTradeCount : 0;

  // Payout promedio ponderado real — para cálculos más precisos
  const avgPayout =
    sorted.reduce((sum, t) => sum + t.payout, 0) / totalTrades;

  const ruinRisk = calculateRuinRisk(winRate, avgPayout, avgRiskPercent);

  // Muestra estadística
  const reliabilityLevel = getReliabilityLevel(totalTrades);
  const isStatisticallyReliable = totalTrades >= 100;

  return {
    totalTrades,
    wins,
    losses,
    winRate,
    totalInvested,
    totalProfit,
    totalLoss,
    netProfitLoss,
    profitFactor,
    mathematicalExpectancy,
    maxWinStreak,
    maxLossStreak,
    currentStreak,
    currentStreakType,
    returnOnCapital,
    equityCurve,
    maxDrawdown,
    maxDrawdownPercent,
    avgRiskPercent,
    ruinRisk,
    isStatisticallyReliable,
    reliabilityLevel,
    avgPayout,
  };
};

// isStrategyProfitable usa avgPayout real, no el payout de configuración
export const isStrategyProfitable = (
  winRate: number,
  avgPayout: number
): boolean => {
  const breakEven = 100 / (100 + avgPayout);
  return winRate / 100 > breakEven;
};

export const getReliabilityLabel = (
  level: TradeStats['reliabilityLevel']
): { label: string; color: string } => {
  switch (level) {
    case 'insufficient':
      return { label: 'Muestra insuficiente', color: '#FF4D6A' };
    case 'low':
      return { label: 'Muestra baja', color: '#FFB547' };
    case 'moderate':
      return { label: 'Muestra moderada', color: '#6C63FF' };
    case 'high':
      return { label: 'Muestra confiable', color: '#00D4AA' };
  }
};