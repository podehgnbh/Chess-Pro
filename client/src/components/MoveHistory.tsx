/**
 * MoveHistory Component - مكون تاريخ الحركات
 * يعرض جميع الحركات التي تمت في اللعبة
 */

import React from 'react';
import { Move } from '@/lib/chess-engine';
import { THEME } from '@/lib/constants';

interface MoveHistoryProps {
  moves: Move[];
  onSelectMove?: (moveIndex: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, onSelectMove }) => {
  const formatMove = (move: Move): string => {
    let notation = `${move.from}${move.to}`;
    if (move.promotion) {
      notation += `=${move.promotion}`;
    }
    return notation;
  };

  const getMoveNumber = (index: number): number => {
    return Math.floor(index / 2) + 1;
  };

  const isWhiteMove = (index: number): boolean => {
    return index % 2 === 0;
  };

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: THEME.primary,
        borderColor: THEME.secondary,
        border: `1px solid ${THEME.secondary}`,
      }}
    >
      <h3 className="font-bold" style={{ color: THEME.secondary }}>
        تاريخ الحركات
      </h3>

      <div
        className="space-y-2 max-h-64 overflow-y-auto"
        style={{
          backgroundColor: THEME.background,
          padding: '8px',
          borderRadius: '4px',
        }}
      >
        {moves.length === 0 ? (
          <p style={{ color: THEME.textSecondary, fontSize: '12px' }}>
            لم تتم أي حركات بعد
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {moves.map((move, index) => (
              <div
                key={index}
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => onSelectMove?.(index)}
                style={{
                  backgroundColor: THEME.secondary,
                  color: THEME.primary,
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {isWhiteMove(index) ? (
                  <span>
                    {getMoveNumber(index)}. {formatMove(move)}
                  </span>
                ) : (
                  <span>{formatMove(move)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="text-xs p-2 rounded"
        style={{
          backgroundColor: THEME.background,
          color: THEME.textSecondary,
        }}
      >
        <p>إجمالي الحركات: {moves.length}</p>
      </div>
    </div>
  );
};
