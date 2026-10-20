import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  Modal,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'win' | 'loss';
  onHide: () => void;
}

export default function Toast({ visible, message, type, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const isWin = type === 'win';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View
          style={[
            styles.container,
            isWin ? styles.containerWin : styles.containerLoss,
            {
              opacity,
              transform: [{ translateY }],
              top: insets.top > 0 ? insets.top + SPACING.md : 40,
            },
          ]}
        >
          <Ionicons
            name={isWin ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={isWin ? COLORS.win : COLORS.loss}
          />
          <Text style={[styles.message, isWin ? styles.textWin : styles.textLoss]}>
            {message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  container: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    zIndex: 999,
  },
  containerWin: {
    backgroundColor: `${COLORS.win}15`,
    borderColor: `${COLORS.win}40`,
  },
  containerLoss: {
    backgroundColor: `${COLORS.loss}15`,
    borderColor: `${COLORS.loss}40`,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  textWin: {
    color: COLORS.win,
  },
  textLoss: {
    color: COLORS.loss,
  },
});