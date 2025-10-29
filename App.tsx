import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Page, UserData, StudyMode, Achievement, Theme, SessionLog, ThemeColors } from './types';
import { ACHIEVEMENTS, SHOP_THEMES, STUDY_MODES, THEME_COLORS } from './constants';
import { loadUserData, saveUserData } from './services/storageService';
import { getMotivationalMessage } from './services/geminiService';

import TimerView from './components/TimerView';
import AchievementsView from './components/AchievementsView';
import StatsView from './components/StatsView';
import ShopView from './components/ShopView';
import Navigation from './components/Navigation';
import MotivationalModal from './components/MotivationalModal';
import Toast from './components/Toast';

type State = {
  userData: UserData;
  newlyUnlockedAchievements: Achievement[];
  motivationalMessage: {
    isLoading: boolean;
    message: string;
    error: string | null;
  };
};

type Action =
  | { type: 'SET_USER_DATA'; payload: UserData }
  | { type: 'COMPLETE_SESSION'; payload: { duration: number; mode: StudyMode } }
  | { type: 'BUY_THEME'; payload: Theme }
  | { type: 'SET_ACTIVE_THEME'; payload: string }
  | { type: 'DISMISS_ACHIEVEMENT'; payload: string }
  | { type: 'FETCH_MOTIVATION_START' }
  | { type: 'FETCH_MOTIVATION_SUCCESS'; payload: string }
  | { type: 'FETCH_MOTIVATION_ERROR'; payload: string }
  | { type: 'CLOSE_MOTIVATION_MODAL' };

const initialState: State = {
  userData: {
    points: 0,
    totalStudyTime: 0,
    unlockedAchievementIds: [],
    unlockedThemeIds: ['default'],
    activeThemeId: 'default',
    sessionLogs: [],
    lastSessionDate: null,
    streak: 0,
  },
  newlyUnlockedAchievements: [],
  motivationalMessage: {
    isLoading: false,
    message: '',
    error: null,
  },
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_USER_DATA':
      return { ...state, userData: action.payload };

    case 'COMPLETE_SESSION': {
      const { duration, mode } = action.payload;
      const pointsEarned = Math.floor(duration / 60);
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = state.userData.streak;
      if (state.userData.lastSessionDate === today) {
        // same day, no change
      } else if (state.userData.lastSessionDate === yesterdayStr) {
        newStreak++;
      } else {
        newStreak = 1;
      }

      const updatedData: UserData = {
        ...state.userData,
        points: state.userData.points + pointsEarned,
        totalStudyTime: state.userData.totalStudyTime + duration,
        sessionLogs: [...state.userData.sessionLogs, { date: new Date().toISOString(), duration, mode: mode.id }],
        lastSessionDate: today,
        streak: newStreak,
      };

      const newlyUnlocked = ACHIEVEMENTS.filter(
        (ach) =>
          !updatedData.unlockedAchievementIds.includes(ach.id) &&
          ach.condition(updatedData)
      );

      updatedData.unlockedAchievementIds.push(...newlyUnlocked.map((a) => a.id));

      return {
        ...state,
        userData: updatedData,
        newlyUnlockedAchievements: [...state.newlyUnlockedAchievements, ...newlyUnlocked],
      };
    }

    case 'BUY_THEME': {
      const theme = action.payload;
      if (state.userData.points < theme.cost) return state;
      return {
        ...state,
        userData: {
          ...state.userData,
          points: state.userData.points - theme.cost,
          unlockedThemeIds: [...state.userData.unlockedThemeIds, theme.id],
        },
      };
    }
    
    case 'SET_ACTIVE_THEME':
      return { ...state, userData: { ...state.userData, activeThemeId: action.payload } };

    case 'DISMISS_ACHIEVEMENT':
      return {
        ...state,
        newlyUnlockedAchievements: state.newlyUnlockedAchievements.filter(
          (ach) => ach.id !== action.payload
        ),
      };

    case 'FETCH_MOTIVATION_START':
      return { ...state, motivationalMessage: { ...initialState.motivationalMessage, isLoading: true } };
      
    case 'FETCH_MOTIVATION_SUCCESS':
      return { ...state, motivationalMessage: { isLoading: false, message: action.payload, error: null } };
      
    case 'FETCH_MOTIVATION_ERROR':
      return { ...state, motivationalMessage: { isLoading: false, message: '', error: action.payload } };
      
    case 'CLOSE_MOTIVATION_MODAL':
      return { ...state, motivationalMessage: initialState.motivationalMessage };

    default:
      return state;
  }
};

export default function App() {
  const [page, setPage] = useState<Page>('timer');
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const data = loadUserData();
    if (data) {
      // Data validation
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (data.lastSessionDate && data.lastSessionDate < yesterdayStr) {
        data.streak = 0;
      }
      dispatch({ type: 'SET_USER_DATA', payload: data });
    }
  }, []);

  useEffect(() => {
    saveUserData(state.userData);
  }, [state.userData]);

  const handleSessionComplete = useCallback(async (duration: number, mode: StudyMode) => {
    dispatch({ type: 'COMPLETE_SESSION', payload: { duration, mode } });

    dispatch({ type: 'FETCH_MOTIVATION_START' });
    try {
      const message = await getMotivationalMessage(mode.name, Math.floor(duration / 60), state.userData.points + Math.floor(duration/60));
      dispatch({ type: 'FETCH_MOTIVATION_SUCCESS', payload: message });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'FETCH_MOTIVATION_ERROR', payload: 'Could not get motivation. Keep up the great work!' });
    }
  }, [state.userData.points]);
  
  const activeTheme: ThemeColors = THEME_COLORS[state.userData.activeThemeId] || THEME_COLORS['default'];

  const renderPage = () => {
    switch (page) {
      case 'timer':
        return <TimerView theme={activeTheme} onSessionComplete={handleSessionComplete} />;
      case 'achievements':
        return <AchievementsView theme={activeTheme} userData={state.userData} />;
      case 'stats':
        return <StatsView theme={activeTheme} userData={state.userData} />;
      case 'shop':
        return <ShopView theme={activeTheme} userData={state.userData} dispatch={dispatch} />;
      default:
        return <TimerView theme={activeTheme} onSessionComplete={handleSessionComplete} />;
    }
  };

  return (
    <div className={`h-screen font-sans flex flex-col overflow-hidden ${activeTheme.bg} ${activeTheme.text}`}>
      <main className="flex-grow container mx-auto w-full">
        {renderPage()}
      </main>

      <Navigation currentPage={page} onNavigate={setPage} theme={activeTheme} points={state.userData.points} />
      
      {state.motivationalMessage.message && (
        <MotivationalModal 
          message={state.motivationalMessage.message}
          isLoading={state.motivationalMessage.isLoading}
          error={state.motivationalMessage.error}
          onClose={() => dispatch({ type: 'CLOSE_MOTIVATION_MODAL' })} 
          theme={activeTheme}
        />
      )}

      {state.newlyUnlockedAchievements.map((achievement, index) => (
        <Toast
          key={achievement.id}
          message={`Achievement Unlocked: ${achievement.name}`}
          onDismiss={() => dispatch({ type: 'DISMISS_ACHIEVEMENT', payload: achievement.id })}
          index={index}
        />
      ))}
    </div>
  );
}