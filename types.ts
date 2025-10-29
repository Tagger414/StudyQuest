
export type Page = 'timer' | 'achievements' | 'stats' | 'shop';

export interface StudyMode {
  id: string;
  name: string;
  studyMinutes: number;
  breakMinutes: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  condition: (userData: UserData) => boolean;
}

export interface Theme {
  id: string;
  name: string;
  cost: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SessionLog {
  date: string;
  duration: number; // in seconds
  mode: string;
}

export interface UserData {
  points: number;
  totalStudyTime: number; // in seconds
  unlockedAchievementIds: string[];
  unlockedThemeIds: string[];
  activeThemeId: string;
  sessionLogs: SessionLog[];
  lastSessionDate: string | null;
  streak: number;
}

export interface ThemeColors {
  bg: string;
  text: string;
  primary: string;
  primaryBg: string;
  primaryBgHover: string;
  secondaryBg: string;
  cardBg: string;
  cardText: string;
  progressBg: string;
  progressFg: string;
  navActive: string;
  navInactive: string;
  buttonText: string;
}
