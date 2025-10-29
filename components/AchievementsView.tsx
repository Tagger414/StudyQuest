import React from 'react';
import { UserData, ThemeColors } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { TrophyIcon } from './icons/Icons';

interface AchievementsViewProps {
  userData: UserData;
  theme: ThemeColors;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ userData, theme }) => {
  const unlockedCount = userData.unlockedAchievementIds.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="pb-20 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <TrophyIcon className={`mx-auto h-12 w-12 ${theme.primary}`} />
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Achievements</h1>
          <p className="mt-2 opacity-80">Track your progress and milestones.</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>Progress</span>
            <span>{unlockedCount} / {totalCount} Unlocked</span>
          </div>
          <div className={`w-full ${theme.progressBg} rounded-full h-2.5`}>
            <div
              className={`${theme.progressFg} h-2.5 rounded-full`}
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = userData.unlockedAchievementIds.includes(achievement.id);
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl flex items-center transition-all duration-300 ${theme.cardBg} ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className={`p-3 rounded-full mr-4 ${isUnlocked ? theme.secondaryBg : 'bg-gray-200'}`}>
                  <Icon className={`w-6 h-6 ${isUnlocked ? theme.primary : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold">{achievement.name}</h3>
                  <p className="text-sm opacity-80">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;