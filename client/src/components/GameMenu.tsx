/**
 * GameMenu Component - مكون قائمة الخيارات
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { THEME, AI_DIFFICULTY_LEVELS } from '@/lib/constants';

interface GameMenuProps {
  onNewGame: () => void;
  onResign: () => void;
  onDraw: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  onChangeDifficulty?: (level: 'easy' | 'medium' | 'hard' | 'expert') => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  onNewGame,
  onResign,
  onDraw,
  onUndo,
  canUndo = false,
  difficulty,
  onChangeDifficulty,
}) => {
  return (
    <div className="space-y-3">
      <Button
        onClick={onNewGame}
        className="w-full"
        style={{
          backgroundColor: THEME.secondary,
          color: THEME.primary,
        }}
      >
        لعبة جديدة
      </Button>

      {difficulty && onChangeDifficulty && (
        <div className="space-y-2">
          <p className="text-sm" style={{ color: THEME.textSecondary }}>
            مستوى الصعوبة:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(AI_DIFFICULTY_LEVELS).map(([key, value]) => (
              <Button
                key={key}
                onClick={() => onChangeDifficulty(key as any)}
                className={`text-xs ${difficulty === key ? 'opacity-100' : 'opacity-50'}`}
                style={{
                  backgroundColor: difficulty === key ? THEME.secondary : THEME.border,
                  color: difficulty === key ? THEME.primary : THEME.text,
                }}
              >
                {value.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {canUndo && onUndo && (
          <Button
            onClick={onUndo}
            className="w-full"
            style={{
              backgroundColor: THEME.border,
              color: THEME.text,
            }}
          >
            تراجع
          </Button>
        )}

        <Button
          onClick={onDraw}
          className="w-full"
          style={{
            backgroundColor: THEME.border,
            color: THEME.text,
          }}
        >
          عرض تعادل
        </Button>

        <Button
          onClick={onResign}
          className="w-full"
          style={{
            backgroundColor: '#FF6B6B',
            color: THEME.text,
          }}
        >
          الاستسلام
        </Button>
      </div>
    </div>
  );
};
