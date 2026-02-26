import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workout, WorkoutLog, FitnessGoal, BodyMetric, SetLog } from '../types';

interface FitnessState {
  activeWorkout: Workout | null;
  workoutLogs: WorkoutLog[];
  goals: FitnessGoal[];
  bodyMetrics: BodyMetric[];
  timerRunning: boolean;
  elapsedSeconds: number;
}

const fitnessSlice = createSlice({
  name: 'fitness',
  initialState: {
    activeWorkout: null, workoutLogs: [], goals: [], bodyMetrics: [],
    timerRunning: false, elapsedSeconds: 0
  } as FitnessState,
  reducers: {
    startWorkout(state, action: PayloadAction<Workout>) {
      state.activeWorkout = { ...action.payload, status: 'in_progress' };
      state.timerRunning = true;
      state.elapsedSeconds = 0;
    },
    pauseTimer(state) { state.timerRunning = false; },
    resumeTimer(state) { state.timerRunning = true; },
    tickTimer(state) { if (state.timerRunning) state.elapsedSeconds++; },
    logSet(state, action: PayloadAction<{ exerciseId: string; setLog: SetLog }>) {
      // Mark set in active workout
    },
    completeWorkout(state, action: PayloadAction<WorkoutLog>) {
      state.workoutLogs.unshift(action.payload);
      state.activeWorkout = null;
      state.timerRunning = false;
      state.elapsedSeconds = 0;
    },
    updateGoal(state, action: PayloadAction<{ id: string; current: number }>) {
      const goal = state.goals.find(g => g.id === action.payload.id);
      if (goal) goal.current = action.payload.current;
    },
    addGoal(state, action: PayloadAction<FitnessGoal>) {
      state.goals.push(action.payload);
    },
    addBodyMetric(state, action: PayloadAction<BodyMetric>) {
      state.bodyMetrics.unshift(action.payload);
    },
  },
});

export const { startWorkout, pauseTimer, resumeTimer, tickTimer, logSet, completeWorkout, updateGoal, addGoal, addBodyMetric } = fitnessSlice.actions;

export const store = configureStore({ reducer: { fitness: fitnessSlice.reducer } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const selectWeeklyStats = (state: RootState) => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyLogs = state.fitness.workoutLogs.filter(l => new Date(l.completedAt).getTime() > oneWeekAgo);
  return {
    workouts: weeklyLogs.length,
    totalMinutes: Math.round(weeklyLogs.reduce((s, l) => s + l.duration, 0) / 60),
    totalCalories: weeklyLogs.reduce((s, l) => s + l.calories, 0),
  };
};
