import React, { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, PAYOUT_OPTIONS } from '../constants';
import { useTradeStore } from '../store/useTradeStore';

export default function SettingsScreen() {
  const { settings, saveSettings, dbError, clearDbError } = useTradeStore();

  const [capital, setCapital] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(85);

  useEffect(() => {
    setCapital(settings.initial_capital > 0 ? String(settings.initial_capital) : '');
    setSelectedPayout(settings.default_payout);
  }, [settings]);

  useEffect(() => {
    if (dbError) {
      Alert.alert('Error', dbError, [{ text: 'OK', onPress: clearDbError }]);
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbError]);

  const handleSave = () => {
    const capitalValue = parseFloat(capital);

    if (!capital || isNaN(capitalValue) || capitalValue <= 0) {
      Alert.alert('Error', 'Ingresa un capital inicial válido.');
      return;
    }

    saveSettings(capitalValue, selectedPayout);
    Alert.alert('Guardado', 'Configuración actualizada correctamente.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Ajusta los parámetros de tu cuenta</Text>

        {/* Capital inicial */}
        <View style={styles.section}>
          <Text style={styles.label}>Capital inicial</Text>
          <Text style={styles.hint}>
            El monto con el que empezaste tu cuenta de trading
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={capital}
              onChangeText={setCapital}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Payout por defecto */}
        <View style={styles.section}>
          <Text style={styles.label}>Payout por defecto</Text>
          <Text style={styles.hint}>
            Se usará como valor inicial al registrar una operación
          </Text>
          <View style={styles.payoutRow}>
            {PAYOUT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.payoutOption,
                  selectedPayout === option && styles.payoutOptionActive,
                ]}
                onPress={() => setSelectedPayout(option)}
              >
                <Text
                  style={[
                    styles.payoutOptionText,
                    selectedPayout === option && styles.payoutOptionTextActive,
                  ]}
                >
                  {option}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>

        {/* Info punto de equilibrio */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Punto de equilibrio</Text>
          <Text style={styles.infoText}>
            Con un payout de {selectedPayout}% necesitas ganar al menos{' '}
            <Text style={styles.infoHighlight}>
              {((100 / (100 + selectedPayout)) * 100).toFixed(2)}%
            </Text>{' '}
            de tus operaciones para ser rentable.
          </Text>
        </View>

      </ScrollView>
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
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textMuted,
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
    fontSize: 18,
    fontWeight: '600',
    padding: SPACING.md,
  },
  payoutRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  payoutOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  payoutOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  payoutOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  payoutOptionTextActive: {
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});