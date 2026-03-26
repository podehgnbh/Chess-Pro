/**
 * ChessClock Component - مكون ساعة الشطرنج
 * يعرض الوقت المتبقي لكل لاعب
 */

import React, { useState, useEffect } from 'react';
import { Color } from '@/lib/chess-engine';
import { THEME } from '@/lib/constants';

interface ChessClockProps {
  whiteTime: number; // بالثواني
  blackTime: number; // بالثواني
  currentTurn: Color;
  isActive: boolean;
  onTimeUp?: (color: Color) => void;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  whiteTime,
  blackTime,
  currentTurn,
  isActive,
  onTimeUp,
}) => {
  const [displayWhiteTime, setDisplayWhiteTime] = useState(whiteTime);
  const [displayBlackTime, setDisplayBlackTime] = useState(blackTime);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (currentTurn === 'white') {
        setDisplayWhiteTime((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0 && prev > 0) {
            onTimeUp?.('white');
          }
          return newTime;
        });
      } else {
        setDisplayBlackTime((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0 && prev > 0) {
            onTimeUp?.('black');
          }
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentTurn, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isWhiteTimeUp = displayWhiteTime === 0;
  const isBlackTimeUp = displayBlackTime === 0;

  return (
    <div className="space-y-3">
      {/* White Clock */}
      <div
        className="p-4 rounded-lg text-center transition-all"
        style={{
          backgroundColor: currentTurn === 'white' ? THEME.secondary : THEME.primary,
          color: currentTurn === 'white' ? THEME.primary : THEME.secondary,
          border: `2px solid ${THEME.secondary}`,
          boxShadow:
            isWhiteTimeUp && currentTurn === 'white'
              ? `0 0 20px ${THEME.secondary}`
              : 'none',
        }}
      >
        <p className="text-xs opacity-75 mb-1">الأبيض</p>
        <p className="text-3xl font-bold font-mono">{formatTime(displayWhiteTime)}</p>
        {isWhiteTimeUp && <p className="text-xs mt-1 text-red-500">انتهى الوقت!</p>}
      </div>

      {/* Black Clock */}
      <div
        className="p-4 rounded-lg text-center transition-all"
        style={{
          backgroundColor: currentTurn === 'black' ? THEME.secondary : THEME.primary,
          color: currentTurn === 'black' ? THEME.primary : THEME.secondary,
          border: `2px solid ${THEME.secondary}`,
          boxShadow:
            isBlackTimeUp && currentTurn === 'black'
              ? `0 0 20px ${THEME.secondary}`
              : 'none',
        }}
      >
        <p className="text-xs opacity-75 mb-1">الأسود</p>
        <p className="text-3xl font-bold font-mono">{formatTime(displayBlackTime)}</p>
        {isBlackTimeUp && <p className="text-xs mt-1 text-red-500">انتهى الوقت!</p>}
      </div>
    </div>
  );
};
