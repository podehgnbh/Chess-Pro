/**
 * Chess AI - ذكاء اصطناعي قوي جداً
 * يستخدم Minimax مع Alpha-Beta Pruning والتقييم المتقدم
 */

import { ChessEngine, Move, GameState, Piece, Color } from './chess-engine';

interface EvaluationScore {
  move: Move;
  score: number;
}

export class ChessAI {
  private engine: ChessEngine;
  private maxDepth: number;
  private evaluationCache: Map<string, number> = new Map();

  // قيم القطع
  private pieceValues = {
    P: 100,
    N: 320,
    B: 330,
    R: 500,
    Q: 900,
    K: 0, // لا يتم تقييم الملك بقيمة مادية
  };

  // جداول الموضع لكل قطعة (Position Square Tables)
  private pawnTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private knightTable = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ];

  private bishopTable = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ];

  private rookTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ];

  private queenTable = [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ];

  private kingMiddlegameTable = [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ];

  private kingEndgameTable = [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-50, -40, -30, -20, -20, -30, -40, -50],
  ];

  constructor(maxDepth: number = 4) {
    this.engine = new ChessEngine();
    this.maxDepth = maxDepth;
  }

  private coordToIndices(coord: string): [number, number] {
    const file = coord.charCodeAt(0) - 97;
    const rank = 8 - parseInt(coord[1]);
    return [rank, file];
  }

  private getPositionalValue(piece: Piece, rank: number, file: number, isEndgame: boolean): number {
    let table: number[][];

    switch (piece.type) {
      case 'P':
        table = this.pawnTable;
        break;
      case 'N':
        table = this.knightTable;
        break;
      case 'B':
        table = this.bishopTable;
        break;
      case 'R':
        table = this.rookTable;
        break;
      case 'Q':
        table = this.queenTable;
        break;
      case 'K':
        table = isEndgame ? this.kingEndgameTable : this.kingMiddlegameTable;
        break;
      default:
        return 0;
    }

    let value = table[rank][file];

    // قلب الجدول للقطع السوداء
    if (piece.color === 'black') {
      value = table[7 - rank][file];
    }

    return value;
  }

  private isEndgame(board: (Piece | null)[][]): boolean {
    let whiteQueens = 0;
    let blackQueens = 0;
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (!piece) continue;

        const value = this.pieceValues[piece.type];
        if (piece.color === 'white') {
          whiteMaterial += value;
          if (piece.type === 'Q') whiteQueens++;
        } else {
          blackMaterial += value;
          if (piece.type === 'Q') blackQueens++;
        }
      }
    }

    // نهاية اللعبة إذا كانت المادة قليلة جداً
    return whiteMaterial + blackMaterial < 1000;
  }

  private evaluatePosition(board: (Piece | null)[][], turn: Color): number {
    let score = 0;
    const isEndgame = this.isEndgame(board);

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (!piece) continue;

        const materialValue = this.pieceValues[piece.type];
        const positionalValue = this.getPositionalValue(piece, rank, file, isEndgame);
        const totalValue = materialValue + positionalValue;

        if (piece.color === 'white') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }

    return score;
  }

  private minimax(
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    turn: Color
  ): number {
    const state = this.engine.getState();
    const cacheKey = JSON.stringify(state) + depth + isMaximizing;

    if (this.evaluationCache.has(cacheKey)) {
      return this.evaluationCache.get(cacheKey)!;
    }

    // قاعدة التوقف
    if (depth === 0 || this.engine.isGameOver()) {
      const evaluation = this.evaluatePosition(this.engine.getBoard(), turn);
      this.evaluationCache.set(cacheKey, evaluation);
      return evaluation;
    }

    const moves = this.engine.getValidMoves();

    if (moves.length === 0) {
      const evaluation = this.evaluatePosition(this.engine.getBoard(), turn);
      this.evaluationCache.set(cacheKey, evaluation);
      return evaluation;
    }

    // ترتيب الحركات (Killer Heuristic)
    const sortedMoves = this.sortMoves(moves);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of sortedMoves) {
        this.engine.makeMove(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, false, turn);
        this.engine = new ChessEngine(); // إعادة تعيين (يجب تحسينها لاحقاً)
        this.engine.getState(); // تحديث الحالة

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
      this.evaluationCache.set(cacheKey, maxEval);
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of sortedMoves) {
        this.engine.makeMove(move);
        const evaluation = this.minimax(depth - 1, alpha, beta, true, turn);
        this.engine = new ChessEngine(); // إعادة تعيين
        this.engine.getState(); // تحديث الحالة

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
      this.evaluationCache.set(cacheKey, minEval);
      return minEval;
    }
  }

  private sortMoves(moves: Move[]): Move[] {
    // ترتيب الحركات بناءً على الأولوية
    return moves.sort((a, b) => {
      // الحركات الهجومية أولاً
      if (a.isCapture && !b.isCapture) return -1;
      if (!a.isCapture && b.isCapture) return 1;

      // الترقيات ثانياً
      if (a.promotion && !b.promotion) return -1;
      if (!a.promotion && b.promotion) return 1;

      return 0;
    });
  }

  findBestMove(): Move | null {
    const moves = this.engine.getValidMoves();
    if (moves.length === 0) return null;

    const evaluations: EvaluationScore[] = [];
    const turn = this.engine.getTurn();

    for (const move of moves) {
      this.engine.makeMove(move);
      const score = this.minimax(this.maxDepth - 1, -Infinity, Infinity, turn === 'white', turn);
      evaluations.push({ move, score });
      this.engine = new ChessEngine(); // إعادة تعيين
    }

    // اختيار أفضل حركة
    const bestEvaluation =
      turn === 'white'
        ? evaluations.reduce((max, curr) => (curr.score > max.score ? curr : max))
        : evaluations.reduce((min, curr) => (curr.score < min.score ? curr : min));

    return bestEvaluation.move;
  }

  setDifficulty(level: 'easy' | 'medium' | 'hard' | 'expert'): void {
    switch (level) {
      case 'easy':
        this.maxDepth = 2;
        break;
      case 'medium':
        this.maxDepth = 3;
        break;
      case 'hard':
        this.maxDepth = 4;
        break;
      case 'expert':
        this.maxDepth = 5;
        break;
    }
  }

  clearCache(): void {
    this.evaluationCache.clear();
  }
}
