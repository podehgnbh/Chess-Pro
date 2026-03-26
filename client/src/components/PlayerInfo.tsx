/**
 * PlayerInfo Component - مكون معلومات اللاعبين
 * يعرض معلومات اللاعبين والقطع المأخوذة
 */

import React from 'react';
import { Piece, Color } from '@/lib/chess-engine';
import { THEME } from '@/lib/constants';

interface PlayerInfoProps {
  playerName: string;
  color: Color;
  capturedPieces: Piece[];
  isActive: boolean;
  rating?: number;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  playerName,
  color,
  capturedPieces,
  isActive,
  rating,
}) => {
  const getPieceUnicode = (piece: Piece): string => {
    const unicode: Record<string, string> = {
      'P-white': '♙',
      'N-white': '♘',
      'B-white': '♗',
      'R-white': '♖',
      'Q-white': '♕',
      'K-white': '♔',
      'P-black': '♟',
      'N-black': '♞',
      'B-black': '♝',
      'R-black': '♜',
      'Q-black': '♛',
      'K-black': '♚',
    };
    return unicode[`${piece.type}-${piece.color}`] || '?';
  };

  const calculateMaterial = (): number => {
    const values = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
    return capturedPieces.reduce((sum, piece) => sum + values[piece.type], 0);
  };

  return (
    <div
      className="p-4 rounded-lg transition-all"
      style={{
        backgroundColor: isActive ? THEME.secondary : THEME.primary,
        color: isActive ? THEME.primary : THEME.text,
        border: `2px solid ${isActive ? THEME.secondary : THEME.border}`,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-lg">{playerName}</p>
          <p className="text-xs opacity-75">
            {color === 'white' ? '♔ أبيض' : '♚ أسود'}
          </p>
        </div>
        {rating && (
          <div
            className="px-3 py-1 rounded text-sm font-bold"
            style={{
              backgroundColor: isActive ? THEME.primary : THEME.secondary,
              color: isActive ? THEME.secondary : THEME.primary,
            }}
          >
            {rating}
          </div>
        )}
      </div>

      {capturedPieces.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs opacity-75">القطع المأخوذة:</p>
          <div className="flex flex-wrap gap-1">
            {capturedPieces.map((piece, index) => (
              <span key={index} className="text-xl">
                {getPieceUnicode(piece)}
              </span>
            ))}
          </div>
          <p className="text-xs opacity-75">
            المادة: +{calculateMaterial()} نقطة
          </p>
        </div>
      )}
    </div>
  );
};
