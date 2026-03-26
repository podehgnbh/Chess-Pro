import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChessEngine, Move } from '@/lib/chess-engine';
import { ChessBoard } from '@/components/ChessBoard';
import { ChessAI } from '@/lib/chess-ai';
import { roomManager, GameRoom } from '@/lib/room-manager';
import { MoveHistory } from '@/components/MoveHistory';
import { ChessClock } from '@/components/ChessClock';
import { PlayerInfo } from '@/components/PlayerInfo';
import { GameMenu } from '@/components/GameMenu';
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
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [capturedWhite, setCapturedWhite] = useState<any[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<any[]>([]);

  useEffect(() => {
    if (gameMode === 'ai' && ai) {
      if (engine.getTurn() !== playerColor && !engine.isGameOver()) {
        setIsAiThinking(true);
        const timer = setTimeout(() => {
          const bestMove = ai.findBestMove();
          if (bestMove) {
            const newEngine = new ChessEngine();
            const state = engine.getState();
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
      
      if (engine.getTurn() === 'white') {
        setBlackTime((prev) => Math.max(0, prev - 1));
      } else {
        setWhiteTime((prev) => Math.max(0, prev - 1));
      }
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
    setWhiteTime(600);
    setBlackTime(600);
    setCapturedWhite([]);
    setCapturedBlack([]);
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel */}
            <div className="space-y-4">
              <PlayerInfo
                playerName={gameMode === 'ai' ? 'الذكاء الاصطناعي' : 'خصمك'}
                color="black"
                capturedPieces={capturedBlack}
                isActive={engine.getTurn() === 'black'}
              />
              <ChessClock
                whiteTime={whiteTime}
                blackTime={blackTime}
                currentTurn={engine.getTurn()}
                isActive={!engine.isGameOver()}
              />
            </div>

            {/* Center - Board */}
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

            {/* Right Panel */}
            <div className="space-y-4">
              <PlayerInfo
                playerName="أنت"
                color="white"
                capturedPieces={capturedWhite}
                isActive={engine.getTurn() === 'white'}
              />

              <Card
                className="p-4"
                style={{
                  backgroundColor: THEME.primary,
                  borderColor: THEME.secondary,
                }}
              >
                <GameMenu
                  onNewGame={resetGame}
                  onResign={() => resetGame()}
                  onDraw={() => resetGame()}
                  difficulty={difficulty}
                  onChangeDifficulty={(level) => {
                    setDifficulty(level);
                    if (ai) ai.setDifficulty(level);
                  }}
                />
              </Card>

              <MoveHistory moves={engine.getMoveHistory()} />

              {gameMode === 'multiplayer' && gameRoom && (
                <Card
                  className="p-4"
                  style={{
                    backgroundColor: THEME.primary,
                    borderColor: THEME.secondary,
                  }}
                >
                  <h3
                    className="text-sm font-bold mb-2"
                    style={{ color: THEME.secondary }}
                  >
                    كود الغرفة
                  </h3>
                  <div
                    className="p-2 rounded text-center text-lg font-bold"
                    style={{
                      backgroundColor: THEME.secondary,
                      color: THEME.primary,
                    }}
                  >
                    {gameRoom.roomCode}
                  </div>
                </Card>
              )}
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
