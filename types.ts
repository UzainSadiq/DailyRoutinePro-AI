import { ElementType } from "react";

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  time: string;
  startTime?: any;
  createdAt?: any;
}

export interface Habit {
  id: string;
  name: string;
  goal: number;
  unit: string;
  color: string;
  iconName: string; // Store icon as a name string to keep it serializable
}

export interface HabitLog {
  id: string;
  userId: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  createdAt: any;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // e.g. "08:00"
  enabled: boolean;
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  audioBeep: boolean;
  repeatWeekly: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
