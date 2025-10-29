
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  index: number;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss, index }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling dismiss
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  const topPosition = `${2 + index * 4}rem`;

  return (
    <div
      style={{ top: topPosition }}
      className={`fixed left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out z-50 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
