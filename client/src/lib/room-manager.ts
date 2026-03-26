/**
 * Room Manager - نظام إدارة الغرف
 * يدير إنشاء الغرف والاتصال بين اللاعبين
 */

import { Move } from './chess-engine';

export interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  isReady: boolean;
}

export interface GameRoom {
  roomCode: string;
  createdAt: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  moves: Move[];
  currentTurn: 'white' | 'black';
  gameResult?: 'white' | 'black' | 'draw';
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private listeners: Map<string, Set<(room: GameRoom) => void>> = new Map();

  generateRoomCode(): string {
    // توليد كود غرفة عشوائي من 6 أحرف وأرقام
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(playerName: string): GameRoom {
    const roomCode = this.generateRoomCode();
    const playerId = this.generatePlayerId();

    const room: GameRoom = {
      roomCode,
      createdAt: Date.now(),
      players: [
        {
          id: playerId,
          name: playerName,
          color: 'white',
          isReady: false,
        },
      ],
      status: 'waiting',
      moves: [],
      currentTurn: 'white',
    };

    this.rooms.set(roomCode, room);
    this.playerToRoom.set(playerId, roomCode);
    this.initializeRoomListeners(roomCode);

    return room;
  }

  joinRoom(roomCode: string, playerName: string): GameRoom | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.players.length >= 2) return null; // الغرفة ممتلئة

    const playerId = this.generatePlayerId();
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      color: 'black',
      isReady: false,
    };

    room.players.push(newPlayer);
    this.playerToRoom.set(playerId, roomCode);
    this.notifyRoomUpdate(roomCode, room);

    return room;
  }

  leaveRoom(playerId: string): void {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);
    this.playerToRoom.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      this.listeners.delete(roomCode);
    } else {
      this.notifyRoomUpdate(roomCode, room);
    }
  }

  playerReady(playerId: string): void {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.isReady = true;

      // بدء اللعبة إذا كان كلا اللاعبين جاهزين
      if (room.players.length === 2 && room.players.every((p) => p.isReady)) {
        room.status = 'playing';
      }

      this.notifyRoomUpdate(roomCode, room);
    }
  }

  makeMove(playerId: string, move: Move): boolean {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return false;

    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'playing') return false;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.color !== room.currentTurn) return false;

    room.moves.push(move);
    room.currentTurn = room.currentTurn === 'white' ? 'black' : 'white';

    this.notifyRoomUpdate(roomCode, room);
    return true;
  }

  finishGame(roomCode: string, result: 'white' | 'black' | 'draw'): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.status = 'finished';
    room.gameResult = result;
    this.notifyRoomUpdate(roomCode, room);
  }

  getRoom(roomCode: string): GameRoom | null {
    return this.rooms.get(roomCode) || null;
  }

  getRoomByPlayerId(playerId: string): GameRoom | null {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;
    return this.rooms.get(roomCode) || null;
  }

  private generatePlayerId(): string {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeRoomListeners(roomCode: string): void {
    if (!this.listeners.has(roomCode)) {
      this.listeners.set(roomCode, new Set());
    }
  }

  private notifyRoomUpdate(roomCode: string, room: GameRoom): void {
    const listeners = this.listeners.get(roomCode);
    if (listeners) {
      listeners.forEach((listener) => listener(room));
    }
  }

  subscribe(roomCode: string, listener: (room: GameRoom) => void): () => void {
    this.initializeRoomListeners(roomCode);
    const listeners = this.listeners.get(roomCode)!;
    listeners.add(listener);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
    };
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  getActiveRooms(): GameRoom[] {
    return Array.from(this.rooms.values()).filter((room) => room.status === 'waiting');
  }
}

// Singleton instance
export const roomManager = new RoomManager();
