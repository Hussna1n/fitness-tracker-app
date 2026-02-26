import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectWeeklyStats } from '../../store';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

function GoalBar({ label, current, target, unit, color = '#6366f1' }: { label: string; current: number; target: number; unit: string; color?: string }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.goalItem}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={styles.goalValue}>{current}/{target} {unit}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.goalPct}>{Math.round(pct)}%</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const { workoutHistory, goals } = useSelector((s: RootState) => s.fitness);
  const weeklyStats = useSelector(selectWeeklyStats);

  // Build last 7 days label
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
  });

  const calorieData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return workoutHistory.filter(w => w.date === key).reduce((s, w) => s + (w.totalCalories ?? 0), 0);
  });

  const durationData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return workoutHistory.filter(w => w.date === key).reduce((s, w) => s + (w.durationMinutes ?? 0), 0);
  });

  const chartConfig = {
    backgroundColor: '#6366f1',
    backgroundGradientFrom: '#6366f1',
    backgroundGradientTo: '#818cf8',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    style: { borderRadius: 16 },
  };

  const statCards = [
    { label: 'Workouts', value: weeklyStats.totalWorkouts, color: '#6366f1' },
    { label: 'Minutes', value: weeklyStats.totalMinutes, color: '#10b981' },
    { label: 'Calories', value: weeklyStats.totalCalories, color: '#f59e0b' },
    { label: 'Avg Duration', value: Math.round(weeklyStats.avgDuration), color: '#3b82f6' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Weekly Summary */}
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.statsGrid}>
        {statCards.map(c => (
          <View key={c.label} style={[styles.statCard, { borderLeftColor: c.color }]}>
            <Text style={[styles.statValue, { color: c.color }]}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Calories Chart */}
      <Text style={styles.sectionTitle}>Daily Calories</Text>
      <View style={styles.chartCard}>
        <BarChart
          data={{ labels: dayLabels, datasets: [{ data: calorieData }] }}
          width={chartWidth - 32}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
          yAxisSuffix=""
          yAxisLabel=""
        />
      </View>

      {/* Duration Line */}
      <Text style={styles.sectionTitle}>Workout Duration (min)</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={{ labels: dayLabels, datasets: [{ data: durationData.map(v => v || 0) }] }}
          width={chartWidth - 32}
          height={180}
          chartConfig={{ ...chartConfig, backgroundGradientFrom: '#10b981', backgroundGradientTo: '#34d399' }}
          style={styles.chart}
          bezier
          fromZero
        />
      </View>

      {/* Goals */}
      <Text style={styles.sectionTitle}>Goals Progress</Text>
      <View style={styles.card}>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>No goals set yet.</Text>
        ) : (
          goals.map(g => (
            <GoalBar
              key={g.id}
              label={g.type.replace('_', ' ')}
              current={g.current}
              target={g.target}
              unit={g.unit}
              color={g.type === 'weight_loss' ? '#ef4444' : '#6366f1'}
            />
          ))
        )}
      </View>

      {/* Recent Workouts */}
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      <View style={styles.card}>
        {workoutHistory.length === 0 ? (
          <Text style={styles.emptyText}>No workouts logged yet.</Text>
        ) : (
          workoutHistory.slice(0, 10).map((w, i) => (
            <View key={i} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyName}>{w.name}</Text>
                <Text style={styles.historyDate}>{w.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyDuration}>{w.durationMinutes}m</Text>
                <Text style={styles.historyCals}>{w.totalCalories} kcal</Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  chart: { borderRadius: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  goalItem: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  goalLabel: { fontSize: 14, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  goalValue: { fontSize: 13, color: '#6b7280' },
  progressBar: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  goalPct: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  historyLeft: { gap: 2 },
  historyRight: { alignItems: 'flex-end', gap: 2 },
  historyName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  historyDate: { fontSize: 12, color: '#9ca3af' },
  historyDuration: { fontSize: 14, fontWeight: '600', color: '#6366f1' },
  historyCals: { fontSize: 12, color: '#9ca3af' },
  emptyText: { color: '#9ca3af', textAlign: 'center', paddingVertical: 24 },
});
