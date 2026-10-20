import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants';

const SkeletonBar = ({
  width,
  height,
  opacity,
}: {
  width: `${number}%` | number;
  height: number;
  opacity: Animated.Value;
}) => (
  <Animated.View
    style={[
      styles.skeletonBar,
      { width, height, borderRadius: RADIUS.sm, opacity },
    ]}
  />
);

export default function LoadingOverlay({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!visible) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <SkeletonBar width="40%" height={14} opacity={opacity} />
      <SkeletonBar width="100%" height={80} opacity={opacity} />
      <SkeletonBar width="100%" height={80} opacity={opacity} />
      <SkeletonBar width="100%" height={80} opacity={opacity} />
      <SkeletonBar width="60%" height={14} opacity={opacity} />
      <SkeletonBar width="100%" height={80} opacity={opacity} />
      <SkeletonBar width="100%" height={80} opacity={opacity} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    paddingTop: 8,
  },
  skeletonBar: {
    backgroundColor: '#1A1A26',
  },
});