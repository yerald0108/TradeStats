import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants';
import { useTradeStore, PeriodFilter } from '../store/useTradeStore';
import { Trade, TradeResult } from '../types';
import TradeForm from '../components/TradeForm';
import LoadingOverlay from '../components/LoadingOverlay';

const PERIODS: { label: string; value: PeriodFilter }[] = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Todo', value: 'all' },
];

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function HistoryScreen() {
  const {
    trades,
    removeTrade,
    editTrade,
    periodFilter,
    setPeriodFilter,
    loadAll,
    isLoading,
    loadMoreTrades,
    dbError,
    clearDbError,
  } = useTradeStore();

  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPayout, setEditPayout] = useState(85);
  const [editResult, setEditResult] = useState<TradeResult>('win');

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  useEffect(() => {
    if (dbError) {
      Alert.alert('Error', dbError, [{ text: 'OK', onPress: clearDbError }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbError]);

  const handleDeleteTrade = (id: number) => {
    Alert.alert(
      'Eliminar operación',
      '¿Estás seguro de que quieres eliminar esta operación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeTrade(id),
        },
      ]
    );
  };

  const handleOpenEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setEditAmount(String(trade.amount));
    setEditPayout(trade.payout);
    setEditResult(trade.result);
  };

  const handleSaveEdit = () => {
    if (!editingTrade) return;
    const amountValue = parseFloat(editAmount);
    if (!editAmount || isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido.');
      return;
    }
    editTrade(editingTrade.id, amountValue, editPayout, editResult);
    setEditingTrade(null);
  };

  const renderItem = ({ item }: { item: Trade }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.resultBadge,
            item.result === 'win' ? styles.badgeWin : styles.badgeLoss,
          ]}
        >
          <Text
            style={[
              styles.resultBadgeText,
              item.result === 'win' ? styles.badgeWinText : styles.badgeLossText,
            ]}
          >
            {item.result === 'win' ? 'WIN' : 'LOSS'}
          </Text>
        </View>
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.cardCenter}>
        <Text style={styles.cardAmount}>Monto: {item.amount.toFixed(2)}</Text>
        <Text style={styles.cardPayout}>Payout: {item.payout}%</Text>
      </View>

      <View style={styles.cardRight}>
        <Text
          style={[
            styles.cardProfitLoss,
            item.profit_loss >= 0 ? styles.textWin : styles.textLoss,
          ]}
        >
          {item.profit_loss >= 0 ? '+' : ''}
          {item.profit_loss.toFixed(2)}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenEdit(item)}
          >
            <Text style={styles.actionEdit}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTrade(item.id)}
          >
            <Text style={styles.actionDelete}>Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Historial</Text>

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

        <Text style={styles.subtitle}>
          {trades.length} operaciones en este período
        </Text>

        {isLoading ? (
          <LoadingOverlay visible={isLoading} />
        ) : trades.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin operaciones</Text>
            <Text style={styles.emptyText}>
              No hay operaciones registradas en este período
            </Text>
          </View>
        ) : (
          <FlatList
            data={trades}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMoreTrades}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isLoading ? (
                <Text style={styles.loadingText}>Cargando más...</Text>
              ) : null
            }
          />
        )}
      </View>

      {/* Modal de edición */}
      <Modal
        visible={editingTrade !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingTrade(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar operación</Text>

            <TradeForm
              amount={editAmount}
              payout={editPayout}
              result={editResult}
              onAmountChange={setEditAmount}
              onPayoutChange={setEditPayout}
              onResultChange={setEditResult}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setEditingTrade(null)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: SPACING.sm,
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
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  list: {
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardLeft: {
    alignItems: 'center',
    gap: SPACING.xs,
    width: 60,
  },
  resultBadge: {
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
  resultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeWinText: {
    color: COLORS.win,
  },
  badgeLossText: {
    color: COLORS.loss,
  },
  cardDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  cardCenter: {
    flex: 1,
    gap: SPACING.xs,
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardPayout: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  cardProfitLoss: {
    fontSize: 16,
    fontWeight: '800',
  },
  textWin: {
    color: COLORS.win,
  },
  textLoss: {
    color: COLORS.loss,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  actionEdit: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionDelete: {
    fontSize: 12,
    color: COLORS.loss,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    paddingVertical: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalSave: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});