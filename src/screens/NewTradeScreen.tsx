import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from '../components/Toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, PAYOUT_OPTIONS } from '../constants';
import { useTradeStore } from '../store/useTradeStore';
import { TradeResult } from '../types';

export default function NewTradeScreen() {
  const { settings, addTrade } = useTradeStore();

  const [amount, setAmount] = useState('');
  const [payout, setPayout] = useState(settings.default_payout);
  const [result, setResult] = useState<TradeResult | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'win' | 'loss';
  }>({ visible: false, message: '', type: 'win' });

  const handleRegister = () => {
    const amountValue = parseFloat(amount);

    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido.');
      return;
    }

    if (!result) {
      Alert.alert('Error', 'Selecciona el resultado de la operación.');
      return;
    }

    addTrade(amountValue, payout, result);

    const profitLoss =
      result === 'win' ? amountValue * (payout / 100) : -amountValue;
    const sign = profitLoss > 0 ? '+' : '';

    setToast({
      visible: true,
      message:
        result === 'win'
          ? `Ganada — ${sign}${profitLoss.toFixed(2)}`
          : `Perdida — ${sign}${profitLoss.toFixed(2)}`,
      type: result,
    });

    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setPayout(settings.default_payout);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

        <Text style={styles.title}>Nueva Operación</Text>
        <Text style={styles.subtitle}>Registra el resultado de tu operativa</Text>

        {/* Monto */}
        <View style={styles.section}>
          <Text style={styles.label}>Monto invertido</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
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
                onPress={() => setPayout(option)}
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
                styles.resultWin,
                result === 'win' && styles.resultWinActive,
              ]}
              onPress={() => setResult('win')}
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
                styles.resultLoss,
                result === 'loss' && styles.resultLossActive,
              ]}
              onPress={() => setResult('loss')}
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

        {/* Preview del resultado */}
        {amount && result && !isNaN(parseFloat(amount)) && (
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

        {/* Botón registrar */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            (!amount || !result) && styles.registerButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={!amount || !result}
        >
          <Text style={styles.registerButtonText}>Registrar operación</Text>
        </TouchableOpacity>

      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
      </KeyboardAvoidingView>
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
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
  resultWin: {
    borderColor: COLORS.border,
  },
  resultWinActive: {
    backgroundColor: `${COLORS.win}20`,
    borderColor: COLORS.win,
  },
  resultLoss: {
    borderColor: COLORS.border,
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
    marginBottom: SPACING.xl,
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
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.4,
  },
  registerButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});