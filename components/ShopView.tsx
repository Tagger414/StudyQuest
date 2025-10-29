import React from 'react';
import { UserData, Theme, ThemeColors } from '../types';
import { SHOP_THEMES, THEME_COLORS } from '../constants';
import { ShoppingBagIcon } from './icons/Icons';

interface ShopViewProps {
  userData: UserData;
  theme: ThemeColors;
  dispatch: React.Dispatch<any>; // Simplified for brevity
}

const ShopView: React.FC<ShopViewProps> = ({ userData, theme, dispatch }) => {
  const handleBuy = (item: Theme) => {
    if (userData.points >= item.cost && !userData.unlockedThemeIds.includes(item.id)) {
      dispatch({ type: 'BUY_THEME', payload: item });
    }
  };

  const handleSelect = (item: Theme) => {
    if (userData.unlockedThemeIds.includes(item.id)) {
      dispatch({ type: 'SET_ACTIVE_THEME', payload: item.id });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="pb-20 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <ShoppingBagIcon className={`mx-auto h-12 w-12 ${theme.primary}`} />
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Reward Shop</h1>
          <p className="mt-2 opacity-80">Use your points to unlock new themes!</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SHOP_THEMES.map((item) => {
            const isUnlocked = userData.unlockedThemeIds.includes(item.id);
            const isActive = userData.activeThemeId === item.id;
            const canAfford = userData.points >= item.cost;
            const themePreview = THEME_COLORS[item.id];

            return (
              <div key={item.id} className={`p-4 rounded-xl shadow-md text-center ${theme.cardBg}`}>
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${themePreview.bg} border-4 ${themePreview.progressFg}`}>
                  <div className={`w-8 h-8 rounded-full ${themePreview.primaryBg}`}></div>
                </div>
                <h3 className="font-bold">{item.name}</h3>
                <p className={`text-sm font-semibold ${theme.primary}`}>{item.cost} Points</p>
                
                <button
                  onClick={() => (isUnlocked ? handleSelect(item) : handleBuy(item))}
                  disabled={!isUnlocked && !canAfford}
                  className={`w-full mt-3 px-4 py-2 text-sm font-bold rounded-full transition-colors ${
                    isActive
                      ? `${theme.secondaryBg}`
                      : isUnlocked
                      ? `${theme.primaryBg} ${theme.buttonText} ${theme.primaryBgHover}`
                      : canAfford
                      ? `${theme.primaryBg} ${theme.buttonText} ${theme.primaryBgHover}`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isActive ? 'Selected' : isUnlocked ? 'Select' : 'Buy'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopView;