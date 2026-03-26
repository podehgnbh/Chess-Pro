/**
 * Chess Engine - محرك الشطرنج الكامل
 * يتضمن جميع القواعد الحقيقية والحركات المعقدة
 */

export type PieceType = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
export type Color = 'white' | 'black';
export type Piece = {
  type: PieceType;
  color: Color;
};

export interface Move {
  from: string;
  to: string;
  promotion?: PieceType;
  isCapture?: boolean;
  isEnPassant?: boolean;
  isCastling?: boolean;
}

export interface GameState {
  board: (Piece | null)[][];
  turn: Color;
  castlingRights: {
    white: { kingside: boolean; queenside: boolean };
    black: { kingside: boolean; queenside: boolean };
  };
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  moveHistory: Move[];
  isCheckmate: boolean;
  isStalemate: boolean;
  isCheck: boolean;
}

export class ChessEngine {
  private state: GameState;

  constructor() {
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    const board: (Piece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Setup white pieces
    board[7] = [
      { type: 'R', color: 'white' },
      { type: 'N', color: 'white' },
      { type: 'B', color: 'white' },
      { type: 'Q', color: 'white' },
      { type: 'K', color: 'white' },
      { type: 'B', color: 'white' },
      { type: 'N', color: 'white' },
      { type: 'R', color: 'white' },
    ];

    for (let i = 0; i < 8; i++) {
      board[6][i] = { type: 'P', color: 'white' };
    }

    // Setup black pieces
    board[0] = [
      { type: 'R', color: 'black' },
      { type: 'N', color: 'black' },
      { type: 'B', color: 'black' },
      { type: 'Q', color: 'black' },
      { type: 'K', color: 'black' },
      { type: 'B', color: 'black' },
      { type: 'N', color: 'black' },
      { type: 'R', color: 'black' },
    ];

    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'P', color: 'black' };
    }

    return {
      board,
      turn: 'white',
      castlingRights: {
        white: { kingside: true, queenside: true },
        black: { kingside: true, queenside: true },
      },
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      moveHistory: [],
      isCheckmate: false,
      isStalemate: false,
      isCheck: false,
    };
  }

  private coordToIndices(coord: string): [number, number] {
    const file = coord.charCodeAt(0) - 97;
    const rank = 8 - parseInt(coord[1]);
    return [rank, file];
  }

  private indicesToCoord(rank: number, file: number): string {
    return String.fromCharCode(97 + file) + (8 - rank);
  }

  private isValidPosition(rank: number, file: number): boolean {
    return rank >= 0 && rank < 8 && file >= 0 && file < 8;
  }

  private getPieceAt(rank: number, file: number): Piece | null {
    if (!this.isValidPosition(rank, file)) return null;
    return this.state.board[rank][file];
  }

  private isOpponentPiece(piece: Piece | null, color: Color): boolean {
    return piece !== null && piece.color !== color;
  }

  private isOwnPiece(piece: Piece | null, color: Color): boolean {
    return piece !== null && piece.color === color;
  }

  private getKingPosition(color: Color): [number, number] {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.state.board[rank][file];
        if (piece && piece.type === 'K' && piece.color === color) {
          return [rank, file];
        }
      }
    }
    throw new Error('King not found');
  }

  private isSquareAttacked(rank: number, file: number, byColor: Color): boolean {
    // Check for pawn attacks
    const pawnDirection = byColor === 'white' ? -1 : 1;
    const pawnRank = rank - pawnDirection;

    for (let f = file - 1; f <= file + 1; f += 2) {
      if (this.isValidPosition(pawnRank, f)) {
        const piece = this.getPieceAt(pawnRank, f);
        if (piece && piece.type === 'P' && piece.color === byColor) {
          return true;
        }
      }
    }

    // Check for knight attacks
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];

    for (const [dr, df] of knightMoves) {
      const nr = rank + dr;
      const nf = file + df;
      if (this.isValidPosition(nr, nf)) {
        const piece = this.getPieceAt(nr, nf);
        if (piece && piece.type === 'N' && piece.color === byColor) {
          return true;
        }
      }
    }

    // Check for bishop/queen diagonal attacks
    const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, df] of diagonals) {
      let nr = rank + dr;
      let nf = file + df;
      while (this.isValidPosition(nr, nf)) {
        const piece = this.getPieceAt(nr, nf);
        if (piece) {
          if ((piece.type === 'B' || piece.type === 'Q') && piece.color === byColor) {
            return true;
          }
          break;
        }
        nr += dr;
        nf += df;
      }
    }

    // Check for rook/queen straight attacks
    const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, df] of straights) {
      let nr = rank + dr;
      let nf = file + df;
      while (this.isValidPosition(nr, nf)) {
        const piece = this.getPieceAt(nr, nf);
        if (piece) {
          if ((piece.type === 'R' || piece.type === 'Q') && piece.color === byColor) {
            return true;
          }
          break;
        }
        nr += dr;
        nf += df;
      }
    }

    // Check for king attacks
    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const nr = rank + dr;
        const nf = file + df;
        if (this.isValidPosition(nr, nf)) {
          const piece = this.getPieceAt(nr, nf);
          if (piece && piece.type === 'K' && piece.color === byColor) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private isInCheck(color: Color): boolean {
    const [kingRank, kingFile] = this.getKingPosition(color);
    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.isSquareAttacked(kingRank, kingFile, opponentColor);
  }

  private getPawnMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = [];
    const direction = color === 'white' ? -1 : 1;
    const startRank = color === 'white' ? 6 : 1;
    const promotionRank = color === 'white' ? 0 : 7;

    const from = this.indicesToCoord(rank, file);

    // Forward move
    const forwardRank = rank + direction;
    if (this.isValidPosition(forwardRank, file) && !this.getPieceAt(forwardRank, file)) {
      const to = this.indicesToCoord(forwardRank, file);
      if (forwardRank === promotionRank) {
        moves.push({ from, to, promotion: 'Q' });
        moves.push({ from, to, promotion: 'R' });
        moves.push({ from, to, promotion: 'B' });
        moves.push({ from, to, promotion: 'N' });
      } else {
        moves.push({ from, to });
      }

      // Double move from start
      if (rank === startRank) {
        const doubleRank = rank + 2 * direction;
        if (!this.getPieceAt(doubleRank, file)) {
          moves.push({ from, to: this.indicesToCoord(doubleRank, file) });
        }
      }
    }

    // Captures
    for (const df of [-1, 1]) {
      const captureFile = file + df;
      const captureRank = rank + direction;
      if (this.isValidPosition(captureRank, captureFile)) {
        const target = this.getPieceAt(captureRank, captureFile);
        if (this.isOpponentPiece(target, color)) {
          const to = this.indicesToCoord(captureRank, captureFile);
          if (captureRank === promotionRank) {
            moves.push({ from, to, promotion: 'Q', isCapture: true });
            moves.push({ from, to, promotion: 'R', isCapture: true });
            moves.push({ from, to, promotion: 'B', isCapture: true });
            moves.push({ from, to, promotion: 'N', isCapture: true });
          } else {
            moves.push({ from, to, isCapture: true });
          }
        }
      }

      // En passant
      if (this.state.enPassantTarget) {
        const [epRank, epFile] = this.coordToIndices(this.state.enPassantTarget);
        if (captureRank === epRank && captureFile === epFile) {
          moves.push({
            from,
            to: this.state.enPassantTarget,
            isCapture: true,
            isEnPassant: true,
          });
        }
      }
    }

    return moves;
  }

  private getKnightMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = [];
    const from = this.indicesToCoord(rank, file);
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];

    for (const [dr, df] of knightMoves) {
      const nr = rank + dr;
      const nf = file + df;
      if (this.isValidPosition(nr, nf)) {
        const target = this.getPieceAt(nr, nf);
        if (!target || this.isOpponentPiece(target, color)) {
          const to = this.indicesToCoord(nr, nf);
          moves.push({ from, to, isCapture: !!target });
        }
      }
    }

    return moves;
  }

  private getBishopMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = [];
    const from = this.indicesToCoord(rank, file);
    const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dr, df] of diagonals) {
      let nr = rank + dr;
      let nf = file + df;
      while (this.isValidPosition(nr, nf)) {
        const target = this.getPieceAt(nr, nf);
        if (!target) {
          moves.push({ from, to: this.indicesToCoord(nr, nf) });
        } else {
          if (this.isOpponentPiece(target, color)) {
            moves.push({ from, to: this.indicesToCoord(nr, nf), isCapture: true });
          }
          break;
        }
        nr += dr;
        nf += df;
      }
    }

    return moves;
  }

  private getRookMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = [];
    const from = this.indicesToCoord(rank, file);
    const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dr, df] of straights) {
      let nr = rank + dr;
      let nf = file + df;
      while (this.isValidPosition(nr, nf)) {
        const target = this.getPieceAt(nr, nf);
        if (!target) {
          moves.push({ from, to: this.indicesToCoord(nr, nf) });
        } else {
          if (this.isOpponentPiece(target, color)) {
            moves.push({ from, to: this.indicesToCoord(nr, nf), isCapture: true });
          }
          break;
        }
        nr += dr;
        nf += df;
      }
    }

    return moves;
  }

  private getQueenMoves(rank: number, file: number, color: Color): Move[] {
    return [
      ...this.getBishopMoves(rank, file, color),
      ...this.getRookMoves(rank, file, color),
    ];
  }

  private getKingMoves(rank: number, file: number, color: Color): Move[] {
    const moves: Move[] = [];
    const from = this.indicesToCoord(rank, file);

    // Regular king moves
    for (let dr = -1; dr <= 1; dr++) {
      for (let df = -1; df <= 1; df++) {
        if (dr === 0 && df === 0) continue;
        const nr = rank + dr;
        const nf = file + df;
        if (this.isValidPosition(nr, nf)) {
          const target = this.getPieceAt(nr, nf);
          if (!target || this.isOpponentPiece(target, color)) {
            moves.push({ from, to: this.indicesToCoord(nr, nf), isCapture: !!target });
          }
        }
      }
    }

    // Castling
    const castlingRights = this.state.castlingRights[color];
    if (!this.isInCheck(color)) {
      // Kingside castling
      if (castlingRights.kingside) {
        const rookFile = 7;
        const rook = this.getPieceAt(rank, rookFile);
        if (rook && rook.type === 'R') {
          const betweenFile1 = 5;
          const betweenFile2 = 6;
          if (!this.getPieceAt(rank, betweenFile1) && !this.getPieceAt(rank, betweenFile2)) {
            if (
              !this.isSquareAttacked(rank, betweenFile1, color === 'white' ? 'black' : 'white') &&
              !this.isSquareAttacked(rank, betweenFile2, color === 'white' ? 'black' : 'white')
            ) {
              moves.push({
                from,
                to: this.indicesToCoord(rank, betweenFile2),
                isCastling: true,
              });
            }
          }
        }
      }

      // Queenside castling
      if (castlingRights.queenside) {
        const rookFile = 0;
        const rook = this.getPieceAt(rank, rookFile);
        if (rook && rook.type === 'R') {
          const betweenFile1 = 1;
          const betweenFile2 = 2;
          const betweenFile3 = 3;
          if (
            !this.getPieceAt(rank, betweenFile1) &&
            !this.getPieceAt(rank, betweenFile2) &&
            !this.getPieceAt(rank, betweenFile3)
          ) {
            if (
              !this.isSquareAttacked(rank, betweenFile2, color === 'white' ? 'black' : 'white') &&
              !this.isSquareAttacked(rank, betweenFile3, color === 'white' ? 'black' : 'white')
            ) {
              moves.push({
                from,
                to: this.indicesToCoord(rank, betweenFile2),
                isCastling: true,
              });
            }
          }
        }
      }
    }

    return moves;
  }

  private getPseudoLegalMoves(color: Color): Move[] {
    const moves: Move[] = [];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.getPieceAt(rank, file);
        if (!piece || piece.color !== color) continue;

        switch (piece.type) {
          case 'P':
            moves.push(...this.getPawnMoves(rank, file, color));
            break;
          case 'N':
            moves.push(...this.getKnightMoves(rank, file, color));
            break;
          case 'B':
            moves.push(...this.getBishopMoves(rank, file, color));
            break;
          case 'R':
            moves.push(...this.getRookMoves(rank, file, color));
            break;
          case 'Q':
            moves.push(...this.getQueenMoves(rank, file, color));
            break;
          case 'K':
            moves.push(...this.getKingMoves(rank, file, color));
            break;
        }
      }
    }

    return moves;
  }

  private isLegalMove(move: Move, color: Color): boolean {
    const [fromRank, fromFile] = this.coordToIndices(move.from);
    const [toRank, toFile] = this.coordToIndices(move.to);

    // Make the move temporarily
    const originalPiece = this.state.board[fromRank][fromFile];
    const capturedPiece = this.state.board[toRank][toFile];

    this.state.board[fromRank][fromFile] = null;
    this.state.board[toRank][toFile] = originalPiece;

    // Check if king is in check
    const isLegal = !this.isInCheck(color);

    // Undo the move
    this.state.board[fromRank][fromFile] = originalPiece;
    this.state.board[toRank][toFile] = capturedPiece;

    return isLegal;
  }

  getValidMoves(coord?: string): Move[] {
    const pseudoLegalMoves = this.getPseudoLegalMoves(this.state.turn);
    const legalMoves = pseudoLegalMoves.filter((move) =>
      this.isLegalMove(move, this.state.turn)
    );

    if (coord) {
      return legalMoves.filter((move) => move.from === coord);
    }

    return legalMoves;
  }

  makeMove(move: Move): boolean {
    const legalMoves = this.getValidMoves();
    const isValidMove = legalMoves.some(
      (m) => m.from === move.from && m.to === move.to && m.promotion === move.promotion
    );

    if (!isValidMove) return false;

    const [fromRank, fromFile] = this.coordToIndices(move.from);
    const [toRank, toFile] = this.coordToIndices(move.to);

    const piece = this.state.board[fromRank][fromFile]!;
    const capturedPiece = this.state.board[toRank][toFile];

    // Handle castling
    if (move.isCastling) {
      this.state.board[toRank][toFile] = piece;
      this.state.board[fromRank][fromFile] = null;

      // Move rook
      if (toFile > fromFile) {
        // Kingside
        const rook = this.state.board[fromRank][7];
        this.state.board[fromRank][7] = null;
        this.state.board[fromRank][5] = rook;
      } else {
        // Queenside
        const rook = this.state.board[fromRank][0];
        this.state.board[fromRank][0] = null;
        this.state.board[fromRank][3] = rook;
      }
    } else if (move.isEnPassant) {
      this.state.board[toRank][toFile] = piece;
      this.state.board[fromRank][fromFile] = null;
      const captureRank = fromRank;
      this.state.board[captureRank][toFile] = null;
    } else {
      this.state.board[toRank][toFile] = piece;
      this.state.board[fromRank][fromFile] = null;

      // Handle promotion
      if (move.promotion) {
        this.state.board[toRank][toFile] = {
          type: move.promotion,
          color: piece.color,
        };
      }
    }

    // Update castling rights
    if (piece.type === 'K') {
      this.state.castlingRights[piece.color].kingside = false;
      this.state.castlingRights[piece.color].queenside = false;
    } else if (piece.type === 'R') {
      if (fromFile === 0) {
        this.state.castlingRights[piece.color].queenside = false;
      } else if (fromFile === 7) {
        this.state.castlingRights[piece.color].kingside = false;
      }
    }

    // Update en passant target
    if (piece.type === 'P' && Math.abs(toRank - fromRank) === 2) {
      this.state.enPassantTarget = this.indicesToCoord(
        (fromRank + toRank) / 2,
        fromFile
      );
    } else {
      this.state.enPassantTarget = null;
    }

    // Update move counters
    if (piece.type === 'P' || capturedPiece) {
      this.state.halfmoveClock = 0;
    } else {
      this.state.halfmoveClock++;
    }

    if (this.state.turn === 'black') {
      this.state.fullmoveNumber++;
    }

    // Switch turn
    this.state.turn = this.state.turn === 'white' ? 'black' : 'white';

    // Update game status
    this.state.isCheck = this.isInCheck(this.state.turn);
    const hasLegalMoves = this.getValidMoves().length > 0;

    if (!hasLegalMoves) {
      if (this.state.isCheck) {
        this.state.isCheckmate = true;
      } else {
        this.state.isStalemate = true;
      }
    }

    this.state.moveHistory.push(move);

    return true;
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getBoard(): (Piece | null)[][] {
    return JSON.parse(JSON.stringify(this.state.board));
  }

  getTurn(): Color {
    return this.state.turn;
  }

  isGameOver(): boolean {
    return this.state.isCheckmate || this.state.isStalemate;
  }

  getGameStatus(): string {
    if (this.state.isCheckmate) {
      const winner = this.state.turn === 'white' ? 'Black' : 'White';
      return `${winner} wins by checkmate`;
    }
    if (this.state.isStalemate) {
      return 'Draw by stalemate';
    }
    if (this.state.isCheck) {
      return `${this.state.turn === 'white' ? 'White' : 'Black'} is in check`;
    }
    return '';
  }

  getMoveHistory(): Move[] {
    return [...this.state.moveHistory];
  }

  resetGame(): void {
    this.state = this.initializeGame();
  }
}
