import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Line, Text as SvgText, Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../constants';
import { useTradeStore, PeriodFilter } from '../store/useTradeStore';
import { isStrategyProfitable, getReliabilityLabel } from '../utils/calculations';
import LoadingOverlay from '../components/LoadingOverlay';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const CHART_HEIGHT = 180;
const CHART_PADDING = 40;

const PERIODS: { label: string; value: PeriodFilter }[] = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Todo', value: 'all' },
];

const EquityChart = ({
  data,
}: {
  data: { date: string; balance: number }[];
}) => {
  if (data.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>
          Registra al menos 2 operaciones para ver la curva
        </Text>
      </View>
    );
  }

  const values = data.map((d) => d.balance);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const innerWidth = CHART_WIDTH - CHART_PADDING * 2;
  const innerHeight = CHART_HEIGHT - CHART_PADDING;

  const points = data.map((d, i) => {
    const x = CHART_PADDING + (i / (data.length - 1)) * innerWidth;
    const y =
      CHART_PADDING / 2 +
      innerHeight -
      ((d.balance - minVal) / range) * innerHeight;
    return `${x},${y}`;
  });

  const pointsString = points.join(' ');

  const lastPoint = data[data.length - 1];
  const lastX =
    CHART_PADDING + ((data.length - 1) / (data.length - 1)) * innerWidth;
  const lastY =
    CHART_PADDING / 2 +
    innerHeight -
    ((lastPoint.balance - minVal) / range) * innerHeight;

  const isPositive =
    data[data.length - 1].balance >= data[0].balance;

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      {/* Línea base */}
      <Line
        x1={CHART_PADDING}
        y1={CHART_PADDING / 2 + innerHeight}
        x2={CHART_PADDING + innerWidth}
        y2={CHART_PADDING / 2 + innerHeight}
        stroke={COLORS.border}
        strokeWidth={1}
      />

      {/* Etiqueta min */}
      <SvgText
        x={CHART_PADDING - 4}
        y={CHART_PADDING / 2 + innerHeight}
        fill={COLORS.textMuted}
        fontSize={10}
        textAnchor="end"
      >
        {minVal.toFixed(0)}
      </SvgText>

      {/* Etiqueta max */}
      <SvgText
        x={CHART_PADDING - 4}
        y={CHART_PADDING / 2}
        fill={COLORS.textMuted}
        fontSize={10}
        textAnchor="end"
      >
        {maxVal.toFixed(0)}
      </SvgText>

      {/* Curva de equity */}
      <Polyline
        points={pointsString}
        fill="none"
        stroke={isPositive ? COLORS.win : COLORS.loss}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Punto final */}
      <Circle
        cx={lastX}
        cy={lastY}
        r={4}
        fill={isPositive ? COLORS.win : COLORS.loss}
      />
    </Svg>
  );
};

const chartStyles = StyleSheet.create({
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});

const StatRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>
      {value}
    </Text>
  </View>
);

export default function StatsScreen() {
  const { stats, periodFilter, setPeriodFilter, loadAll, settings, isLoading } =
    useTradeStore();

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  // Bug fix #2: avgPayout proviene de stats (calculado sobre el período completo),
  // no sobre el slice paginado que expone `trades`.
  const avgPayout =
    stats.avgPayout > 0 ? stats.avgPayout : settings.default_payout;

  const profitable = isStrategyProfitable(stats.winRate, avgPayout);
  const reliability = getReliabilityLabel(stats.reliabilityLevel);

  const formatPercent = (val: number) => `${val.toFixed(2)}%`;
  const formatNumber = (val: number) => {
    if (val === Infinity) return '∞';
    return val.toFixed(2);
  };
  const formatSigned = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Estadísticas</Text>

        {/* Filtros de período */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.periodButton,
                periodFilter === p.value && styles.periodButtonActive,
              ]}
              onPress={() => setPeriodFilter(p.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  periodFilter === p.value && styles.periodButtonTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <LoadingOverlay visible={isLoading} />
        ) : stats.totalTrades === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin datos</Text>
            <Text style={styles.emptyText}>
              No hay operaciones registradas en este período
            </Text>
          </View>
        ) : (
          <>
            {/* Banner de confiabilidad estadística */}
            <View
              style={[
                styles.reliabilityBanner,
                { borderColor: `${reliability.color}40`, backgroundColor: `${reliability.color}10` },
              ]}
            >
            <View style={[styles.reliabilityDot, { backgroundColor: reliability.color }]} />
            <View style={styles.reliabilityTextBlock}>
              <Text style={[styles.reliabilityLabel, { color: reliability.color }]}>
                {reliability.label} — {stats.totalTrades} operaciones
              </Text>
              {!stats.isStatisticallyReliable && (
                <Text style={styles.reliabilityHint}>
                  {stats.reliabilityLevel === 'insufficient'
                    ? 'Necesitas al menos 30 operaciones para ver patrones iniciales.'
                    : stats.reliabilityLevel === 'low'
                    ? 'Con 60+ operaciones tendrás mayor claridad sobre tu estrategia.'
                    : 'Con 100+ operaciones las métricas serán estadísticamente confiables.'}
                </Text>
              )}
              </View>
            </View>
            {/* Indicador de rentabilidad */}
            <View
              style={[
                styles.profitabilityCard,
                profitable
                  ? styles.profitabilityCardWin
                  : styles.profitabilityCardLoss,
              ]}
            >
              <Text style={styles.profitabilityLabel}>
                Estado de la estrategia
              </Text>
              <Text
                style={[
                  styles.profitabilityValue,
                  profitable ? styles.textWin : styles.textLoss,
                ]}
              >
                {profitable ? 'Rentable' : 'No rentable'}
              </Text>
              <Text style={styles.profitabilityHint}>
                Win rate actual: {formatPercent(stats.winRate)} — Mínimo
                requerido:{' '}
                {formatPercent(
                  (100 / (100 + avgPayout)) * 100
                )}
              </Text>
            </View>

            {/* Curva de equity */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Curva de equity</Text>
              <EquityChart data={stats.equityCurve} />
            </View>

            {/* Métricas generales */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumen general</Text>
              <StatRow
                label="Total operaciones"
                value={String(stats.totalTrades)}
              />
              <StatRow
                label="Ganadas"
                value={String(stats.wins)}
                valueColor={COLORS.win}
              />
              <StatRow
                label="Perdidas"
                value={String(stats.losses)}
                valueColor={COLORS.loss}
              />
              <StatRow
                label="Win rate"
                value={formatPercent(stats.winRate)}
                valueColor={
                  stats.winRate >= 50 ? COLORS.win : COLORS.loss
                }
              />
            </View>

            {/* Métricas financieras */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rendimiento financiero</Text>
              <StatRow
                label="Total invertido"
                value={formatNumber(stats.totalInvested)}
              />
              <StatRow
                label="Ganancias brutas"
                value={formatNumber(stats.totalProfit)}
                valueColor={COLORS.win}
              />
              <StatRow
                label="Pérdidas brutas"
                value={formatNumber(stats.totalLoss)}
                valueColor={COLORS.loss}
              />
              <StatRow
                label="P&L neto"
                value={formatSigned(stats.netProfitLoss)}
                valueColor={
                  stats.netProfitLoss >= 0 ? COLORS.win : COLORS.loss
                }
              />
              <StatRow
                label="Rendimiento sobre capital"
                value={formatSigned(stats.returnOnCapital) + '%'}
                valueColor={
                  stats.returnOnCapital >= 0 ? COLORS.win : COLORS.loss
                }
              />
            </View>

            {/* Métricas avanzadas */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Métricas avanzadas</Text>
              <StatRow
                label="Profit factor"
                value={formatNumber(stats.profitFactor)}
                valueColor={
                  stats.profitFactor >= 1 ? COLORS.win : COLORS.loss
                }
              />
              <StatRow
                label="Expectativa matemática"
                value={formatSigned(stats.mathematicalExpectancy)}
                valueColor={
                  stats.mathematicalExpectancy >= 0
                    ? COLORS.win
                    : COLORS.loss
                }
              />
              <StatRow
                label="Racha máxima ganadora"
                value={String(stats.maxWinStreak)}
                valueColor={COLORS.win}
              />
              <StatRow
                label="Racha máxima perdedora"
                value={String(stats.maxLossStreak)}
                valueColor={COLORS.loss}
              />
              <StatRow
                label="Racha actual"
                value={`${stats.currentStreak} ${
                  stats.currentStreakType === 'win' ? 'victorias' : 'pérdidas'
                }`}
                valueColor={
                  stats.currentStreakType === 'win'
                    ? COLORS.win
                    : COLORS.loss
                }
              />
            </View>

            {/* Gestión de riesgo */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Gestión de riesgo</Text>
              <StatRow
                label="Riesgo promedio por op."
                value={
                  settings.initial_capital > 0
                    ? `${stats.avgRiskPercent.toFixed(2)}%`
                    : 'Sin capital registrado'
                }
                valueColor={
                  stats.avgRiskPercent <= 2
                    ? COLORS.win
                    : stats.avgRiskPercent <= 5
                    ? COLORS.warning
                    : COLORS.loss
                }
              />
              <StatRow
                label="Drawdown máximo"
                value={
                  stats.maxDrawdown > 0
                    ? `${stats.maxDrawdownPercent.toFixed(2)}% (${stats.maxDrawdown.toFixed(2)})`
                    : '0.00%'
                }
                valueColor={
                  stats.maxDrawdownPercent <= 10
                    ? COLORS.win
                    : stats.maxDrawdownPercent <= 25
                    ? COLORS.warning
                    : COLORS.loss
                }
              />
              <StatRow
                label="Riesgo de ruina"
                value={
                  settings.initial_capital > 0
                    ? `${stats.ruinRisk.toFixed(2)}%`
                    : 'Sin capital registrado'
                }
                valueColor={
                  stats.ruinRisk <= 5
                    ? COLORS.win
                    : stats.ruinRisk <= 20
                    ? COLORS.warning
                    : COLORS.loss
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: SPACING.lg,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  periodButtonTextActive: {
    color: COLORS.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  profitabilityCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  profitabilityCardWin: {
    backgroundColor: `${COLORS.win}10`,
    borderColor: `${COLORS.win}40`,
  },
  profitabilityCardLoss: {
    backgroundColor: `${COLORS.loss}10`,
    borderColor: `${COLORS.loss}40`,
  },
  profitabilityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profitabilityValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  profitabilityHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  textWin: {
    color: COLORS.win,
  },
  textLoss: {
    color: COLORS.loss,
  },
  reliabilityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  reliabilityTextBlock: {
    flex: 1,
    gap: SPACING.xs,
  },
  reliabilityLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  reliabilityHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
});