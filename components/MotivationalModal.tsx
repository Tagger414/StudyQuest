
import React from 'react';
import { ThemeColors } from '../types';

interface MotivationalModalProps {
  isLoading: boolean;
  message: string;
  error: string | null;
  onClose: () => void;
  theme: ThemeColors;
}

const MotivationalModal: React.FC<MotivationalModalProps> = ({ isLoading, message, error, onClose, theme }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${theme.cardBg} ${theme.cardText} rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center`}>
        <h2 className="text-xl font-bold mb-4">Session Complete!</h2>
        {isLoading && <p>Getting your feedback...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-lg">"{message}"</p>}
        <button
          onClick={onClose}
          className={`mt-6 w-full px-4 py-2 ${theme.primaryBg} ${theme.buttonText} font-bold rounded-full ${theme.primaryBgHover} transition-colors`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MotivationalModal;
