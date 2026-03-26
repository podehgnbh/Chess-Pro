/**
 * GameStats Component - مكون الإحصائيات والنتائج
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { THEME } from '@/lib/constants';

interface GameStatsProps {
  totalMoves: number;
  whiteTime: number;
  blackTime: number;
  result?: 'white' | 'black' | 'draw';
  resultReason?: string;
}

export const GameStats: React.FC<GameStatsProps> = ({
  totalMoves,
  whiteTime,
  blackTime,
  result,
  resultReason,
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      className="p-6 space-y-4"
      style={{
        backgroundColor: THEME.primary,
        borderColor: THEME.secondary,
      }}
    >
      <h3 className="text-xl font-bold" style={{ color: THEME.secondary }}>
        إحصائيات اللعبة
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-3 rounded text-center"
          style={{
            backgroundColor: THEME.background,
          }}
        >
          <p style={{ color: THEME.textSecondary }} className="text-sm">
            إجمالي الحركات
          </p>
          <p className="text-2xl font-bold" style={{ color: THEME.secondary }}>
            {totalMoves}
          </p>
        </div>

        <div
          className="p-3 rounded text-center"
          style={{
            backgroundColor: THEME.background,
          }}
        >
          <p style={{ color: THEME.textSecondary }} className="text-sm">
            متوسط الحركة
          </p>
          <p className="text-2xl font-bold" style={{ color: THEME.secondary }}>
            {totalMoves > 0 ? (totalMoves / 2).toFixed(1) : '0'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div
          className="p-3 rounded"
          style={{
            backgroundColor: THEME.background,
          }}
        >
          <p style={{ color: THEME.textSecondary }} className="text-sm mb-1">
            وقت الأبيض المتبقي
          </p>
          <p className="font-mono font-bold">{formatTime(whiteTime)}</p>
        </div>

        <div
          className="p-3 rounded"
          style={{
            backgroundColor: THEME.background,
          }}
        >
          <p style={{ color: THEME.textSecondary }} className="text-sm mb-1">
            وقت الأسود المتبقي
          </p>
          <p className="font-mono font-bold">{formatTime(blackTime)}</p>
        </div>
      </div>

      {result && (
        <div
          className="p-4 rounded text-center"
          style={{
            backgroundColor: THEME.secondary,
            color: THEME.primary,
          }}
        >
          <p className="font-bold text-lg mb-1">
            {result === 'draw' ? 'تعادل' : result === 'white' ? 'فوز الأبيض' : 'فوز الأسود'}
          </p>
          {resultReason && <p className="text-sm">{resultReason}</p>}
        </div>
      )}
    </Card>
  );
};
