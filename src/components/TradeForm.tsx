import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, RADIUS, PAYOUT_OPTIONS } from '../constants';
import { TradeResult } from '../types';

interface TradeFormProps {
  amount: string;
  payout: number;
  result: TradeResult | null;
  onAmountChange: (value: string) => void;
  onPayoutChange: (value: number) => void;
  onResultChange: (value: TradeResult) => void;
  showPreview?: boolean;
}

export default function TradeForm({
  amount,
  payout,
  result,
  onAmountChange,
  onPayoutChange,
  onResultChange,
  showPreview = false,
}: TradeFormProps) {
  return (
    <View style={styles.container}>

      {/* Monto */}
      <View style={styles.section}>
        <Text style={styles.label}>Monto invertido</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Payout */}
      <View style={styles.section}>
        <Text style={styles.label}>Payout</Text>
        <View style={styles.payoutRow}>
          {PAYOUT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                payout === option && styles.optionButtonActive,
              ]}
              onPress={() => onPayoutChange(option)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  payout === option && styles.optionButtonTextActive,
                ]}
              >
                {option}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Resultado */}
      <View style={styles.section}>
        <Text style={styles.label}>Resultado</Text>
        <View style={styles.resultRow}>
          <TouchableOpacity
            style={[
              styles.resultButton,
              result === 'win' && styles.resultWinActive,
            ]}
            onPress={() => onResultChange('win')}
          >
            <Text
              style={[
                styles.resultButtonText,
                result === 'win' && styles.resultWinText,
              ]}
            >
              Ganada
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resultButton,
              result === 'loss' && styles.resultLossActive,
            ]}
            onPress={() => onResultChange('loss')}
          >
            <Text
              style={[
                styles.resultButtonText,
                result === 'loss' && styles.resultLossText,
              ]}
            >
              Perdida
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vista previa — solo en NewTradeScreen */}
      {showPreview && amount && result && !isNaN(parseFloat(amount)) && (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Vista previa</Text>
          <Text
            style={[
              styles.previewValue,
              result === 'win' ? styles.previewWin : styles.previewLoss,
            ]}
          >
            {result === 'win'
              ? `+${(parseFloat(amount) * (payout / 100)).toFixed(2)}`
              : `-${parseFloat(amount).toFixed(2)}`}
          </Text>
          <Text style={styles.previewSub}>
            {result === 'win'
              ? `Ganarías ${payout}% sobre ${amount}`
              : `Perderías el monto invertido`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    padding: SPACING.md,
  },
  payoutRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  optionButtonTextActive: {
    color: COLORS.textPrimary,
  },
  resultRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  resultButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  resultWinActive: {
    backgroundColor: `${COLORS.win}20`,
    borderColor: COLORS.win,
  },
  resultLossActive: {
    backgroundColor: `${COLORS.loss}20`,
    borderColor: COLORS.loss,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  resultWinText: {
    color: COLORS.win,
  },
  resultLossText: {
    color: COLORS.loss,
  },
  previewBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  previewValue: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  previewWin: {
    color: COLORS.win,
  },
  previewLoss: {
    color: COLORS.loss,
  },
  previewSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});