import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '../constants';
import { useTradeStore } from '../store/useTradeStore';
import { TradeResult } from '../types';
import TradeForm from '../components/TradeForm';
import Toast from '../components/Toast';

export default function NewTradeScreen() {
  const { settings, addTrade, dbError, clearDbError } = useTradeStore();

  const [amount, setAmount] = useState('');
  const [payout, setPayout] = useState(settings.default_payout);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'win' | 'loss';
  }>({ visible: false, message: '', type: 'win' });

  // Sincronizar payout con settings cada vez que el usuario vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      setPayout(settings.default_payout);
    }, [settings.default_payout])
  );

  useEffect(() => {
    if (dbError) {
      Alert.alert('Error', dbError, [{ text: 'OK', onPress: clearDbError }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbError]);

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

          <TradeForm
            amount={amount}
            payout={payout}
            result={result}
            onAmountChange={setAmount}
            onPayoutChange={setPayout}
            onResultChange={setResult}
            showPreview
          />

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
      </KeyboardAvoidingView>
      <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((t) => ({ ...t, visible: false }))}
        />
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
    gap: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: -SPACING.md,
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