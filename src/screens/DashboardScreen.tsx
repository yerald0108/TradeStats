import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '../constants';
import { useTradeStore } from '../store/useTradeStore';
import { isStrategyProfitable, getReliabilityLabel } from '../utils/calculations';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
  // Bug fix #1: Dashboard ya no comparte estado con History/Stats.
  // Usa dashboardStats (always all-time) y recentTrades (5 más recientes).
  const { dashboardStats, recentTrades, settings, loadDashboard, loadSettings } =
    useTradeStore();

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      loadDashboard();
    }, [])
  );

  // Bug fix #2: avgPayout viene de dashboardStats, calculado sobre el
  // total de operaciones — nunca sobre el slice paginado.
  const avgPayout =
    dashboardStats.avgPayout > 0
      ? dashboardStats.avgPayout
      : settings.default_payout;

  const profitable = isStrategyProfitable(dashboardStats.winRate, avgPayout);
  const reliability = getReliabilityLabel(dashboardStats.reliabilityLevel);
  const currentBalance = settings.initial_capital + dashboardStats.netProfitLoss;
  const capitalPending = settings.initial_capital === 0;

  const navigation = useNavigation<any>();

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>TradeStats</Text>
          <View
            style={[
              styles.statusBadge,
              profitable ? styles.statusBadgeWin : styles.statusBadgeLoss,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                profitable ? styles.textWin : styles.textLoss,
              ]}
            >
              {profitable ? 'Rentable' : 'No rentable'}
            </Text>
          </View>
        </View>

        {/* Aviso capital no configurado */}
        {capitalPending && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Configura tu capital inicial en ajustes para ver el rendimiento real de tu cuenta
            </Text>
          </View>
        )}

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance actual</Text>
          <Text style={styles.balanceValue}>{currentBalance.toFixed(2)}</Text>
          <Text
            style={[
              styles.balancePnl,
              dashboardStats.netProfitLoss >= 0 ? styles.textWin : styles.textLoss,
            ]}
          >
            {formatSigned(dashboardStats.netProfitLoss)} total
          </Text>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Capital inicial</Text>
              <Text style={styles.balanceItemValue}>
                {settings.initial_capital.toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceSeparator} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Retorno</Text>
              <Text
                style={[
                  styles.balanceItemValue,
                  dashboardStats.returnOnCapital >= 0 ? styles.textWin : styles.textLoss,
                ]}
              >
                {formatSigned(dashboardStats.returnOnCapital)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Win Rate</Text>
            <Text
              style={[
                styles.gridValue,
                dashboardStats.winRate >= 50 ? styles.textWin : styles.textLoss,
              ]}
            >
              {dashboardStats.winRate.toFixed(1)}%
            </Text>
            <Text style={styles.gridSub}>
              {dashboardStats.wins}W / {dashboardStats.losses}L
            </Text>
          </View>

          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Profit Factor</Text>
            <Text
              style={[
                styles.gridValue,
                dashboardStats.profitFactor >= 1 ? styles.textWin : styles.textLoss,
              ]}
            >
              {dashboardStats.profitFactor === Infinity
                ? '∞'
                : dashboardStats.profitFactor.toFixed(2)}
            </Text>
            <Text style={styles.gridSub}>
              {dashboardStats.profitFactor >= 1 ? 'Favorable' : 'Desfavorable'}
            </Text>
          </View>

          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Expectativa</Text>
            <Text
              style={[
                styles.gridValue,
                dashboardStats.mathematicalExpectancy >= 0
                  ? styles.textWin
                  : styles.textLoss,
              ]}
            >
              {formatSigned(dashboardStats.mathematicalExpectancy)}
            </Text>
            <Text style={styles.gridSub}>por operación</Text>
          </View>

          <View style={styles.gridCard}>
            <Text style={styles.gridLabel}>Operaciones</Text>
            <Text style={styles.gridValue}>{dashboardStats.totalTrades}</Text>
            <Text style={styles.gridSub}>registradas</Text>
          </View>
        </View>

        {/* Racha actual */}
        {dashboardStats.totalTrades > 0 && (
          <View
            style={[
              styles.streakCard,
              dashboardStats.currentStreakType === 'win'
                ? styles.streakCardWin
                : styles.streakCardLoss,
            ]}
          >
            <Text style={styles.streakLabel}>Racha actual</Text>
            <Text
              style={[
                styles.streakValue,
                dashboardStats.currentStreakType === 'win'
                  ? styles.textWin
                  : styles.textLoss,
              ]}
            >
              {dashboardStats.currentStreak}{' '}
              {dashboardStats.currentStreakType === 'win' ? 'victorias' : 'pérdidas'}{' '}
              consecutivas
            </Text>
          </View>
        )}

        {/* Confiabilidad estadística */}
        {dashboardStats.totalTrades > 0 && (
          <View
            style={[
              styles.reliabilityCard,
              {
                borderColor: `${reliability.color}40`,
                backgroundColor: `${reliability.color}10`,
              },
            ]}
          >
            <View
              style={[styles.reliabilityDot, { backgroundColor: reliability.color }]}
            />
            <Text style={[styles.reliabilityText, { color: reliability.color }]}>
              {reliability.label} — {dashboardStats.totalTrades} operaciones
            </Text>
          </View>
        )}

        {/* Gestión de riesgo */}
        {dashboardStats.totalTrades > 0 && settings.initial_capital > 0 && (
          <View style={styles.riskGrid}>
            <View style={styles.riskCard}>
              <Text style={styles.riskLabel}>Riesgo/op.</Text>
              <Text
                style={[
                  styles.riskValue,
                  dashboardStats.avgRiskPercent <= 2
                    ? styles.textWin
                    : dashboardStats.avgRiskPercent <= 5
                    ? styles.textWarning
                    : styles.textLoss,
                ]}
              >
                {dashboardStats.avgRiskPercent.toFixed(1)}%
              </Text>
              <Text style={styles.riskSub}>del capital</Text>
            </View>

            <View style={styles.riskCard}>
              <Text style={styles.riskLabel}>Drawdown</Text>
              <Text
                style={[
                  styles.riskValue,
                  dashboardStats.maxDrawdownPercent <= 10
                    ? styles.textWin
                    : dashboardStats.maxDrawdownPercent <= 25
                    ? styles.textWarning
                    : styles.textLoss,
                ]}
              >
                {dashboardStats.maxDrawdownPercent.toFixed(1)}%
              </Text>
              <Text style={styles.riskSub}>máximo</Text>
            </View>

            <View style={styles.riskCard}>
              <Text style={styles.riskLabel}>Riesgo ruina</Text>
              <Text
                style={[
                  styles.riskValue,
                  dashboardStats.ruinRisk <= 5
                    ? styles.textWin
                    : dashboardStats.ruinRisk <= 20
                    ? styles.textWarning
                    : styles.textLoss,
                ]}
              >
                {dashboardStats.ruinRisk.toFixed(1)}%
              </Text>
              <Text style={styles.riskSub}>probabilidad</Text>
            </View>
          </View>
        )}

        {/* Últimas operaciones */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Últimas operaciones</Text>
            {dashboardStats.totalTrades > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.recentCta}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentTrades.length === 0 ? (
            <View style={styles.recentEmpty}>
              <Text style={styles.recentEmptyText}>
                Aún no hay operaciones registradas
              </Text>
            </View>
          ) : (
            recentTrades.map((trade) => (
              <View key={trade.id} style={styles.recentCard}>
                <View
                  style={[
                    styles.recentBadge,
                    trade.result === 'win' ? styles.badgeWin : styles.badgeLoss,
                  ]}
                >
                  <Text
                    style={[
                      styles.recentBadgeText,
                      trade.result === 'win' ? styles.textWin : styles.textLoss,
                    ]}
                  >
                    {trade.result === 'win' ? 'WIN' : 'LOSS'}
                  </Text>
                </View>
                <Text style={styles.recentAmount}>
                  Monto: {trade.amount.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.recentPnl,
                    trade.profit_loss >= 0 ? styles.textWin : styles.textLoss,
                  ]}
                >
                  {trade.profit_loss >= 0 ? '+' : ''}
                  {trade.profit_loss.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusBadgeWin: {
    backgroundColor: `${COLORS.win}15`,
    borderColor: `${COLORS.win}40`,
  },
  statusBadgeLoss: {
    backgroundColor: `${COLORS.loss}15`,
    borderColor: `${COLORS.loss}40`,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  balancePnl: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  balanceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  balanceRow: {
    flexDirection: 'row',
    width: '100%',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  balanceSeparator: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  balanceItemLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  gridCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2,
    gap: SPACING.xs,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gridSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  streakCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCardWin: {
    backgroundColor: `${COLORS.win}10`,
    borderColor: `${COLORS.win}30`,
  },
  streakCardLoss: {
    backgroundColor: `${COLORS.loss}10`,
    borderColor: `${COLORS.loss}30`,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  streakValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentSection: {
    gap: SPACING.sm,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recentEmpty: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  recentEmptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  recentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recentBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeWin: {
    backgroundColor: `${COLORS.win}20`,
    borderColor: COLORS.win,
  },
  badgeLoss: {
    backgroundColor: `${COLORS.loss}20`,
    borderColor: COLORS.loss,
  },
  recentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recentAmount: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  recentPnl: {
    fontSize: 14,
    fontWeight: '800',
  },
  textWin: {
    color: COLORS.win,
  },
  textLoss: {
    color: COLORS.loss,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.warning}40`,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.warning,
    lineHeight: 18,
  },
  reliabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reliabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reliabilityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  riskGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  riskCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 2,
  },
  riskLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  riskValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  riskSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  textWarning: {
    color: COLORS.warning,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentCta: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});