import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Vibration } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, pauseTimer, resumeTimer, tickTimer } from '../../store';

interface Props {
  mode: 'stopwatch' | 'countdown';
  countdownSeconds?: number;
  onComplete?: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function WorkoutTimer({ mode, countdownSeconds = 60, onComplete }: Props) {
  const dispatch = useDispatch();
  const { timerRunning, elapsedSeconds } = useSelector((s: RootState) => s.fitness);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const scale = useSharedValue(1);

  const displayTime = mode === 'stopwatch'
    ? elapsedSeconds
    : Math.max(0, countdownSeconds - elapsedSeconds);

  const progress = mode === 'countdown' ? (displayTime / countdownSeconds) * 100 : 0;

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        dispatch(tickTimer());
        if (mode === 'countdown' && elapsedSeconds >= countdownSeconds - 1) {
          clearInterval(intervalRef.current);
          Vibration.vibrate([0, 500, 200, 500]);
          onComplete?.();
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, elapsedSeconds]);

  useEffect(() => {
    if (timerRunning) {
      scale.value = withRepeat(withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      scale.value = withTiming(1);
    }
  }, [timerRunning]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container}>
      {/* Circular Progress */}
      <Animated.View style={[styles.clockContainer, animatedStyle]}>
        <View style={[styles.progressRing, { borderColor: timerRunning ? '#6366f1' : '#e5e7eb' }]}>
          <Text style={[styles.timeText, mode === 'countdown' && displayTime <= 10 && { color: '#ef4444' }]}>
            {formatTime(displayTime)}
          </Text>
          {mode === 'countdown' && (
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          )}
        </View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        {timerRunning ? (
          <Pressable onPress={() => dispatch(pauseTimer())} style={[styles.btn, styles.pauseBtn]}>
            <Ionicons name="pause" size={28} color="#fff" />
          </Pressable>
        ) : (
          <Pressable onPress={() => dispatch(resumeTimer())} style={[styles.btn, styles.playBtn]}>
            <Ionicons name="play" size={28} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.statLabel}>Elapsed</Text>
        </View>
        {mode === 'countdown' && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(displayTime)}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  clockContainer: { alignItems: 'center', justifyContent: 'center' },
  progressRing: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  timeText: { fontSize: 44, fontWeight: '800', color: '#111827', letterSpacing: -2 },
  progressText: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  controls: { flexDirection: 'row', gap: 16 },
  btn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  playBtn: { backgroundColor: '#6366f1' },
  pauseBtn: { backgroundColor: '#f59e0b' },
  stats: { flexDirection: 'row', gap: 32 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
