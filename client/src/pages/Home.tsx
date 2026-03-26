import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChessEngine, Move } from '@/lib/chess-engine';
import { ChessBoard } from '@/components/ChessBoard';
import { ChessAI } from '@/lib/chess-ai';
import { roomManager, GameRoom } from '@/lib/room-manager';
import { THEME, AI_DIFFICULTY_LEVELS } from '@/lib/constants';

type GameMode = 'menu' | 'ai' | 'multiplayer' | 'online';

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [engine, setEngine] = useState<ChessEngine>(new ChessEngine());
  const [ai, setAi] = useState<ChessAI | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    if (gameMode === 'ai' && ai) {
      if (engine.getTurn() !== playerColor && !engine.isGameOver()) {
        setIsAiThinking(true);
        const timer = setTimeout(() => {
          const bestMove = ai.findBestMove();
          if (bestMove) {
            const newEngine = new ChessEngine();
            // Copy game state
            const state = engine.getState();
            // Make moves
            for (const move of state.moveHistory) {
              newEngine.makeMove(move);
            }
            newEngine.makeMove(bestMove);
            setEngine(newEngine);
          }
          setIsAiThinking(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [engine, gameMode, ai, playerColor]);

  const handleMove = (move: Move) => {
    const newEngine = new ChessEngine();
    const state = engine.getState();
    
    for (const prevMove of state.moveHistory) {
      newEngine.makeMove(prevMove);
    }

    if (newEngine.makeMove(move)) {
      setEngine(newEngine);
    }
  };

  const startAiGame = (selectedDifficulty: 'easy' | 'medium' | 'hard' | 'expert', color: 'white' | 'black') => {
    setDifficulty(selectedDifficulty);
    setPlayerColor(color);
    const newEngine = new ChessEngine();
    setEngine(newEngine);
    const newAi = new ChessAI(AI_DIFFICULTY_LEVELS[selectedDifficulty].depth);
    setAi(newAi);
    setGameMode('ai');
  };

  const createRoom = () => {
    if (!playerName.trim()) return;
    const room = roomManager.createRoom(playerName);
    setGameRoom(room);
    setRoomCode(room.roomCode);
    setShowCreateDialog(false);
    setGameMode('multiplayer');
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    const room = roomManager.joinRoom(roomCode.toUpperCase(), playerName);
    if (room) {
      setGameRoom(room);
      setGameMode('multiplayer');
      setShowJoinDialog(false);
    }
  };

  const resetGame = () => {
    setEngine(new ChessEngine());
    setGameMode('menu');
    setGameRoom(null);
    setRoomCode('');
    setPlayerName('');
  };

  const getGameStatus = () => {
    const status = engine.getGameStatus();
    if (status) return status;
    return engine.getTurn() === 'white' ? 'White to move' : 'Black to move';
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(135deg, ${THEME.background} 0%, #1a1a1a 100%)`,
        color: THEME.text,
      }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: THEME.border,
          backgroundColor: THEME.primary,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ color: THEME.secondary }}
            >
              ♔ Chess Pro ♔
            </h1>
            <p style={{ color: THEME.textSecondary }}>
              لعبة الشطرنج الاحترافية - Professional Chess Game
            </p>
          </div>
          <div style={{ color: THEME.textSecondary }}>
            <p>© عبد الله مصطفى - Abdullah Mustafa</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {gameMode === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Play vs AI */}
            <Card
              className="p-8"
              style={{
                backgroundColor: THEME.primary,
                borderColor: THEME.secondary,
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: THEME.secondary }}
              >
                اللعب ضد الذكاء الاصطناعي
              </h2>
              <div className="space-y-4">
                <p style={{ color: THEME.textSecondary }}>
                  اختر مستوى الصعوبة:
                </p>
                {Object.entries(AI_DIFFICULTY_LEVELS).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Button
                      onClick={() => startAiGame(key as any, 'white')}
                      className="flex-1"
                      style={{
                        backgroundColor: THEME.secondary,
                        color: THEME.primary,
                      }}
                    >
                      {value.label} - أبيض
                    </Button>
                    <Button
                      onClick={() => startAiGame(key as any, 'black')}
                      className="flex-1"
                      style={{
                        backgroundColor: THEME.secondary,
                        color: THEME.primary,
                      }}
                    >
                      {value.label} - أسود
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Multiplayer */}
            <Card
              className="p-8"
              style={{
                backgroundColor: THEME.primary,
                borderColor: THEME.secondary,
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: THEME.secondary }}
              >
                اللعب مع الأصدقاء
              </h2>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full"
                  style={{
                    backgroundColor: THEME.secondary,
                    color: THEME.primary,
                  }}
                >
                  إنشاء غرفة جديدة
                </Button>
                <Button
                  onClick={() => setShowJoinDialog(true)}
                  className="w-full"
                  style={{
                    backgroundColor: THEME.secondary,
                    color: THEME.primary,
                  }}
                >
                  الانضمام إلى غرفة
                </Button>
              </div>
            </Card>
          </div>
        )}

        {(gameMode === 'ai' || gameMode === 'multiplayer') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Board */}
            <div className="lg:col-span-2">
              <Card
                className="p-6"
                style={{
                  backgroundColor: THEME.primary,
                  borderColor: THEME.secondary,
                }}
              >
                <ChessBoard
                  engine={engine}
                  onMove={handleMove}
                  playerColor={playerColor}
                  disabled={isAiThinking || engine.isGameOver()}
                />
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card
                className="p-6"
                style={{
                  backgroundColor: THEME.primary,
                  borderColor: THEME.secondary,
                }}
              >
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: THEME.secondary }}
                >
                  معلومات اللعبة
                </h3>
                <div className="space-y-3">
                  <div>
                    <p style={{ color: THEME.textSecondary }}>الحالة:</p>
                    <p className="font-bold">{getGameStatus()}</p>
                  </div>
                  {gameMode === 'ai' && (
                    <div>
                      <p style={{ color: THEME.textSecondary }}>مستوى الصعوبة:</p>
                      <p className="font-bold">{AI_DIFFICULTY_LEVELS[difficulty].label}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ color: THEME.textSecondary }}>لونك:</p>
                    <p className="font-bold">
                      {playerColor === 'white' ? 'أبيض' : 'أسود'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: THEME.textSecondary }}>عدد الحركات:</p>
                    <p className="font-bold">{engine.getMoveHistory().length}</p>
                  </div>
                </div>
              </Card>

              {gameMode === 'multiplayer' && gameRoom && (
                <Card
                  className="p-6"
                  style={{
                    backgroundColor: THEME.primary,
                    borderColor: THEME.secondary,
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: THEME.secondary }}
                  >
                    كود الغرفة
                  </h3>
                  <div
                    className="p-4 rounded text-center text-2xl font-bold"
                    style={{
                      backgroundColor: THEME.secondary,
                      color: THEME.primary,
                    }}
                  >
                    {gameRoom.roomCode}
                  </div>
                  <p
                    className="text-sm mt-2"
                    style={{ color: THEME.textSecondary }}
                  >
                    شارك هذا الكود مع صديقك
                  </p>
                </Card>
              )}

              <Button
                onClick={resetGame}
                className="w-full"
                style={{
                  backgroundColor: THEME.secondary,
                  color: THEME.primary,
                }}
              >
                العودة إلى القائمة الرئيسية
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Create Room Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إنشاء غرفة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="اسمك"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Button onClick={createRoom} className="w-full">
              إنشاء الغرفة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الانضمام إلى غرفة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="اسمك"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Input
              placeholder="كود الغرفة"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <Button onClick={joinRoom} className="w-full">
              الانضمام
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
