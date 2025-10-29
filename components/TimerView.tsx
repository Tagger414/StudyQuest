import React, { useState, useMemo, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { STUDY_MODES } from '../constants';
import { StudyMode, ThemeColors } from '../types';

interface TimerViewProps {
  theme: ThemeColors;
  onSessionComplete: (duration: number, mode: StudyMode) => void;
}

const TimerView: React.FC<TimerViewProps> = ({ theme, onSessionComplete }) => {
  const [activeMode, setActiveMode] = useState<StudyMode>(STUDY_MODES.pomodoro);
  const [cycles, setCycles] = useState(1);
  const [customStudy, setCustomStudy] = useState(STUDY_MODES.custom.studyMinutes);
  const [customBreak, setCustomBreak] = useState(STUDY_MODES.custom.breakMinutes);
  
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [totalStudyTimeInSession, setTotalStudyTimeInSession] = useState(0);
  const [elapsedSecondsInSession, setElapsedSecondsInSession] = useState(0);

  const isCustom = activeMode.id === 'custom';
  
  const sessionPhases = useMemo(() => {
    const phases: { type: 'study' | 'break'; duration: number }[] = [];
    const studyDuration = (isCustom ? customStudy : activeMode.studyMinutes) * 60;
    const breakDuration = (isCustom ? customBreak : activeMode.breakMinutes) * 60;

    for (let i = 0; i < cycles; i++) {
        if (studyDuration > 0) phases.push({ type: 'study', duration: studyDuration });
        if (i < cycles - 1 && breakDuration > 0) {
            phases.push({ type: 'break', duration: breakDuration });
        }
    }
    return phases;
  }, [cycles, isCustom, customStudy, customBreak, activeMode.studyMinutes, activeMode.breakMinutes]);

  const currentPhase = sessionPhases[currentPhaseIndex] || sessionPhases[0];
  const sessionType = currentPhase?.type || 'study';
  const currentDuration = currentPhase?.duration || 0;
  
  const handleTimerComplete = () => {
    const completedPhase = sessionPhases[currentPhaseIndex];
    
    // Add completed time to total elapsed
    setElapsedSecondsInSession(prev => prev + completedPhase.duration);
    
    // If it was a study session, add to the study-specific total
    if (completedPhase.type === 'study') {
      setTotalStudyTimeInSession(prev => prev + completedPhase.duration);
    }
    
    // Check if there's a next phase
    if (currentPhaseIndex < sessionPhases.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
    } else {
      // Session is fully complete
      onSessionComplete(totalStudyTimeInSession + completedPhase.duration, activeMode);
      handleReset();
    }
  };

  const timer = useTimer(currentDuration, handleTimerComplete);
  
  useEffect(() => {
    // When the phase changes, reset the timer.
    // If the whole session is running, start the new phase automatically.
    // Otherwise, just reset to the initial state for that phase.
    timer.reset(sessionInProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhaseIndex, sessionInProgress]);

  const handleModeChange = (modeId: string) => {
    if (sessionInProgress) return;
    setActiveMode(STUDY_MODES[modeId]);
    handleReset();
  };

  const handleReset = () => {
    timer.reset();
    setSessionInProgress(false);
    setCurrentPhaseIndex(0);
    setElapsedSecondsInSession(0);
    setTotalStudyTimeInSession(0);
  };
  
  useEffect(() => {
      handleReset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, cycles, customStudy, customBreak]);


  const handleStart = () => {
    setSessionInProgress(true);
    timer.start();
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  
  const totalSessionDuration = useMemo(() => {
      return sessionPhases.reduce((total, phase) => total + phase.duration, 0);
  }, [sessionPhases]);

  const elapsedInCurrentTimer = currentDuration - timer.seconds;
  const totalElapsed = elapsedSecondsInSession + elapsedInCurrentTimer;
  const currentCycle = sessionPhases.slice(0, currentPhaseIndex + 1).filter(p => p.type === 'study').length;
  
  // This needs to be a mutable variable for the map function to work correctly
  let accumulatedDuration = 0;

  const timerSizeClasses = sessionInProgress
    ? 'w-72 h-72 md:w-96 md:h-96'
    : 'w-64 h-64 md:w-80 md:h-80';
  const innerCircleSizeClasses = sessionInProgress
    ? 'w-64 h-64 md:w-[22rem] md:h-[22rem]'
    : 'w-60 h-60 md:w-72 md:h-72';
  const timeTextSizeClasses = sessionInProgress
    ? 'text-7xl md:text-8xl'
    : 'text-6xl md:text-7xl';

  return (
    <div className="flex flex-col items-center justify-around h-full pb-20 px-4">
      <h1 className={`text-3xl md:text-4xl font-bold transition-opacity duration-300 text-center ${theme.primary}`}>
        {sessionType === 'study' ? (timer.isActive ? 'Focus...' : 'Ready To Focus?') : 'Time for a break!'}
      </h1>

      <div className={`relative flex items-center justify-center rounded-full transition-all duration-500 ease-in-out ${timerSizeClasses} ${theme.secondaryBg}`}>
        <div className={`absolute rounded-full bg-white/50 transition-all duration-500 ease-in-out ${innerCircleSizeClasses}`}></div>
         {sessionInProgress && (
          <div className={`absolute top-8 text-sm font-semibold tracking-wider uppercase ${theme.primary}`}>
            Cycle {currentCycle} / {cycles}
          </div>
        )}
        <span className={`relative font-mono transition-all duration-500 ease-in-out ${timeTextSizeClasses}`}>{formatTime(timer.seconds)}</span>
      </div>

      <div className="flex items-center space-x-4">
        {!timer.isActive ? (
          <button onClick={handleStart} className={`px-10 py-3 ${theme.primaryBg} ${theme.buttonText} font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform ${theme.primaryBgHover}`}>
            {sessionInProgress ? 'Resume' : 'Start'}
          </button>
        ) : (
           <button onClick={timer.pause} className={`px-10 py-3 ${theme.primaryBg} ${theme.buttonText} font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform ${theme.primaryBgHover}`}>
            Pause
          </button>
        )}
        <button onClick={handleReset} className={`px-10 py-3 ${theme.cardBg} font-bold rounded-full shadow-lg transform hover:scale-105 transition-transform`}>
          Reset
        </button>
      </div>
      
      <div className={`w-full max-w-sm transition-opacity duration-300 ${sessionInProgress || totalSessionDuration > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between text-xs opacity-80 mb-1">
          <span>Total Progress</span>
          <span>{formatTime(Math.floor(totalElapsed))} / {formatTime(totalSessionDuration)}</span>
        </div>
        <div className={`w-full ${theme.progressBg} rounded-full h-3 flex overflow-hidden items-center p-[2px]`}>
            <div className="w-full h-full flex gap-[2px]">
                {sessionPhases.map((phase, index) => {
                    const segmentWidth = (phase.duration / totalSessionDuration) * 100;
                    
                    const segmentStart = accumulatedDuration;
                    const fillRatio = Math.max(0, Math.min(1, (totalElapsed - segmentStart) / phase.duration));
                    const fillPercentage = fillRatio * 100;
                    
                    accumulatedDuration += phase.duration;
                    
                    const segmentColor = phase.type === 'study' ? theme.progressFg : `${theme.progressFg} opacity-40`;


                    return (
                        <div 
                            key={index}
                            className="h-full bg-black/10 rounded-sm overflow-hidden"
                            style={{ width: `${segmentWidth}%` }}
                        >
                            <div 
                                className={`${segmentColor} h-full rounded-sm transition-all duration-300`}
                                style={{ width: `${fillPercentage}%` }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      <div className={`w-full max-w-md transition-all duration-500 ease-in-out ${
          sessionInProgress ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100 mt-6'
        }`}>
        <div className={`flex justify-center space-x-2 p-1.5 rounded-full ${theme.secondaryBg} mb-6`}>
            {Object.values(STUDY_MODES).map((mode) => (
            <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                disabled={sessionInProgress}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeMode.id === mode.id ? `${theme.primaryBg} ${theme.buttonText} shadow` : 'text-current'
                }`}
            >
                {mode.name}
            </button>
            ))}
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl shadow-md ${theme.cardBg}`}>
                <h3 className="font-bold mb-3">Session Plan</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                    <label htmlFor="cycles">Cycles:</label>
                    <input 
                        type="number" 
                        id="cycles" 
                        min="1" 
                        max="10" 
                        value={cycles} 
                        onChange={(e) => {
                            if (!sessionInProgress) {
                                setCycles(Math.max(1, parseInt(e.target.value, 10) || 1));
                            }
                        }}
                        disabled={sessionInProgress}
                        className={`w-16 p-1 rounded text-center ${theme.bg} disabled:opacity-50`} 
                    />
                </div>
                <div className="text-xs space-y-1 opacity-80">
                    <p>Total Study: {formatTime((isCustom ? customStudy : activeMode.studyMinutes) * cycles * 60)}</p>
                    <p>Total Break: {formatTime((isCustom ? customBreak : activeMode.breakMinutes) * Math.max(0, cycles - 1) * 60)}</p>
                    <p>Total Time: {formatTime(totalSessionDuration)}</p>
                </div>
            </div>
            {isCustom && (
                <div className={`p-4 rounded-xl shadow-md ${theme.cardBg}`}>
                    <h3 className="font-bold mb-3">Custom Times</h3>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <label htmlFor="study-time">Study (min):</label>
                        <input 
                            type="number" 
                            id="study-time" 
                            min="1" max="120" 
                            value={customStudy} 
                            onChange={(e) => {
                                if (!sessionInProgress) {
                                    setCustomStudy(parseInt(e.target.value, 10) || 1);
                                }
                            }}
                            disabled={sessionInProgress}
                            className={`w-16 p-1 rounded text-center ${theme.bg} disabled:opacity-50`}
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <label htmlFor="break-time">Break (min):</label>
                        <input 
                            type="number" 
                            id="break-time" 
                            min="1" max="30" 
                            value={customBreak} 
                            onChange={(e) => {
                                if (!sessionInProgress) {
                                    setCustomBreak(parseInt(e.target.value, 10) || 1);
                                }
                            }} 
                            disabled={sessionInProgress}
                            className={`w-16 p-1 rounded text-center ${theme.bg} disabled:opacity-50`} 
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TimerView;