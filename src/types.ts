export type MoodType =
  | "Happy"
  | "Sad"
  | "Stressed"
  | "Anxious"
  | "Excited"
  | "Frustrated"
  | "Calm"
  | "Overwhelmed"
  | "Grateful"
  | "Tired";

export interface MoodResult {
  mood: MoodType;
  emoji: string;
  color: string;
  insight: string;
  suggestion: string;
}

export interface MoodLog extends MoodResult {
  id: string;
  timestamp: string;
  userInput: string;
  completedSelfCare: boolean;
}
