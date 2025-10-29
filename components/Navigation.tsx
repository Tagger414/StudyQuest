
import React from 'react';
import { Page, ThemeColors } from '../types';
import { TimerIcon, TrophyIcon, ChartBarIcon, ShoppingBagIcon } from './icons/Icons';

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  theme: ThemeColors;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, isActive, onClick, theme }) => {
  const activeClass = theme.navActive;
  const inactiveClass = theme.navInactive;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  theme: ThemeColors;
  points: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, theme, points }) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${theme.secondaryBg} shadow-[0_-2px_5px_rgba(0,0,0,0.1)] flex md:justify-center`}>
      <div className="flex justify-around w-full max-w-lg">
        <NavButton
          label="Timer"
          icon={<TimerIcon />}
          isActive={currentPage === 'timer'}
          onClick={() => onNavigate('timer')}
          theme={theme}
        />
        <NavButton
          label="Goals"
          icon={<TrophyIcon />}
          isActive={currentPage === 'achievements'}
          onClick={() => onNavigate('achievements')}
          theme={theme}
        />
        <NavButton
          label="Stats"
          icon={<ChartBarIcon />}
          isActive={currentPage === 'stats'}
          onClick={() => onNavigate('stats')}
          theme={theme}
        />
        <div className="relative">
             <NavButton
                label="Shop"
                icon={<ShoppingBagIcon />}
                isActive={currentPage === 'shop'}
                onClick={() => onNavigate('shop')}
                theme={theme}
            />
            <div className={`absolute top-1 right-3 px-2 py-0.5 ${theme.primaryBg} ${theme.buttonText} text-xs font-bold rounded-full`}>
                {points}
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
