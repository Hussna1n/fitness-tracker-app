export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'hiit';
  muscleGroups: string[];
  sets?: number;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds
  calories: number;
  instructions: string[];
  imageUrl?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  totalDuration: number; // seconds
  totalCalories: number;
  status: 'planned' | 'in_progress' | 'completed';
  completedAt?: string;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  duration: number;
  calories: number;
  exercises: ExerciseLog[];
  completedAt: string;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
}

export interface SetLog {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

export interface FitnessGoal {
  id: string;
  type: 'workouts_per_week' | 'calories_per_week' | 'weight_target' | 'steps_per_day';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

export interface BodyMetric {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  bmr?: number;
}
