/**
 * ChessBoard Component - مكون لوحة الشطرنج التفاعلية
 * Design: Classic Elegant with Gold & Black theme
 */

import React, { useState, useEffect } from 'react';
import { ChessEngine, Move, Piece, Color } from '@/lib/chess-engine';
import { COLORS, BOARD_FILES, BOARD_RANKS } from '@/lib/constants';

interface ChessBoardProps {
  engine: ChessEngine;
  onMove: (move: Move) => void;
  playerColor?: Color;
  disabled?: boolean;
}

interface SquareHighlight {
  coord: string;
  type: 'selected' | 'valid' | 'lastMove' | 'check';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  engine,
  onMove,
  playerColor = 'white',
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<SquareHighlight[]>([]);
  const [board, setBoard] = useState(engine.getBoard());

  useEffect(() => {
    setBoard(engine.getBoard());
    updateHighlights();
  }, [engine]);

  const updateHighlights = () => {
    const state = engine.getState();
    const newHighlights: SquareHighlight[] = [];

    // آخر حركة
    if (state.moveHistory.length > 0) {
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      newHighlights.push({ coord: lastMove.from, type: 'lastMove' });
      newHighlights.push({ coord: lastMove.to, type: 'lastMove' });
    }

    // الملك في الفحص
    if (state.isCheck) {
      const kingColor = state.turn;
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = board[rank][file];
          if (piece && piece.type === 'K' && piece.color === kingColor) {
            const coord = String.fromCharCode(97 + file) + (8 - rank);
            newHighlights.push({ coord, type: 'check' });
          }
        }
      }
    }

    setHighlights(newHighlights);
  };

  const handleSquareClick = (coord: string) => {
    if (disabled || engine.getTurn() !== playerColor) return;

    if (selectedSquare === coord) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    const piece = getPieceAt(coord);

    if (selectedSquare) {
      // محاولة تنفيذ الحركة
      if (validMoves.includes(coord)) {
        const move: Move = { from: selectedSquare, to: coord };
        
        // التحقق من الترقية
        const [fromRank] = coordToIndices(selectedSquare);
        const [toRank] = coordToIndices(coord);
        const movingPiece = getPieceAt(selectedSquare);
        
        if (movingPiece?.type === 'P' && (toRank === 0 || toRank === 7)) {
          move.promotion = 'Q';
        }

        onMove(move);
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (piece && piece.color === playerColor) {
        setSelectedSquare(coord);
        const moves = engine.getValidMoves(coord);
        setValidMoves(moves.map((m) => m.to));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      if (piece && piece.color === playerColor) {
        setSelectedSquare(coord);
        const moves = engine.getValidMoves(coord);
        setValidMoves(moves.map((m) => m.to));
      }
    }
  };

  const coordToIndices = (coord: string): [number, number] => {
    const file = coord.charCodeAt(0) - 97;
    const rank = 8 - parseInt(coord[1]);
    return [rank, file];
  };

  const getPieceAt = (coord: string): Piece | null => {
    const [rank, file] = coordToIndices(coord);
    return board[rank][file];
  };

  const getHighlightType = (coord: string): SquareHighlight['type'] | null => {
    const highlight = highlights.find((h) => h.coord === coord);
    return highlight?.type || null;
  };

  const isLightSquare = (file: number, rank: number): boolean => {
    return (file + rank) % 2 === 0;
  };

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

  const renderSquare = (file: number, rank: number) => {
    const coord = String.fromCharCode(97 + file) + (8 - rank);
    const piece = board[rank][file];
    const isLight = isLightSquare(file, rank);
    const isSelected = selectedSquare === coord;
    const isValid = validMoves.includes(coord);
    const highlightType = getHighlightType(coord);

    let backgroundColor = isLight ? COLORS.light : COLORS.dark;

    if (isSelected) {
      backgroundColor = COLORS.selected;
    } else if (highlightType === 'lastMove') {
      backgroundColor = COLORS.highlight;
    } else if (highlightType === 'check') {
      backgroundColor = '#FF6B6B';
    }

    return (
      <div
        key={coord}
        onClick={() => handleSquareClick(coord)}
        className="relative w-full aspect-square cursor-pointer transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor,
          border: isSelected ? `3px solid ${COLORS.selected}` : 'none',
        }}
      >
        {isValid && !piece && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: COLORS.selected,
              borderRadius: '50%',
              opacity: 0.6,
            }}
          />
        )}

        {isValid && piece && (
          <div
            className="absolute inset-0"
            style={{
              border: `3px solid ${COLORS.selected}`,
            }}
          />
        )}

        {piece && (
          <div
            className="w-full h-full flex items-center justify-center text-5xl select-none"
            style={{
              color: piece.color === 'white' ? COLORS.white : COLORS.black,
              textShadow:
                piece.color === 'white'
                  ? `2px 2px 4px ${COLORS.black}`
                  : `2px 2px 4px ${COLORS.white}`,
            }}
          >
            {getPieceUnicode(piece)}
          </div>
        )}

        {file === 0 && (
          <div
            className="absolute bottom-1 left-1 text-xs font-bold"
            style={{
              color: isLight ? COLORS.dark : COLORS.light,
              opacity: 0.5,
            }}
          >
            {BOARD_RANKS[rank]}
          </div>
        )}

        {rank === 7 && (
          <div
            className="absolute bottom-1 right-1 text-xs font-bold"
            style={{
              color: isLight ? COLORS.dark : COLORS.light,
              opacity: 0.5,
            }}
          >
            {BOARD_FILES[file]}
          </div>
        )}
      </div>
    );
  };

  const squares = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      squares.push(renderSquare(file, rank));
    }
  }

  return (
    <div
      className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        gap: 0,
        border: `8px solid ${COLORS.gold}`,
      }}
    >
      {squares}
    </div>
  );
};
