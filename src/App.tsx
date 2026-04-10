import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dices, 
  Trophy, 
  RotateCcw, 
  User, 
  ArrowUpRight, 
  TrendingDown,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Game Constants
const BOARD_SIZE = 10;
const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

const SNAKES: Record<number, number> = {
  99: 7,
  92: 35,
  73: 53,
  64: 60,
  46: 25,
  16: 6,
};

const LADDERS: Record<number, number> = {
  2: 38,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
  87: 94,
};

type Player = {
  id: number;
  name: string;
  position: number;
  color: string;
  secondaryColor: string;
};

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'Player 1', position: 1, color: '#3b82f6', secondaryColor: '#60a5fa' }, // Blue
  { id: 2, name: 'Player 2', position: 1, color: '#ec4899', secondaryColor: '#f472b6' }, // Pink
];

export default function App() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameLog, setGameLog] = useState<string[]>(['Welcome to Neon Snakes & Ladders!']);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: 'snake' | 'ladder' | 'move', from: number, to: number } | null>(null);

  const currentPlayer = players[currentPlayerIndex];

  const addToLog = (message: string) => {
    setGameLog(prev => [message, ...prev].slice(0, 5));
  };

  const getSquareCoords = (square: number) => {
    const zeroBased = square - 1;
    const row = Math.floor(zeroBased / BOARD_SIZE);
    const col = zeroBased % BOARD_SIZE;
    
    // Zigzag logic
    const x = row % 2 === 0 ? col : (BOARD_SIZE - 1 - col);
    const y = (BOARD_SIZE - 1) - row;
    
    return { x, y };
  };

  const rollDice = async () => {
    if (isRolling || winner) return;

    setIsRolling(true);
    setLastAction(null);
    
    // Simulate rolling animation
    let finalValue = 1;
    for (let i = 0; i < 10; i++) {
      finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      await new Promise(r => setTimeout(r, 80));
    }

    setIsRolling(false);
    movePlayer(finalValue);
  };

  const movePlayer = useCallback((steps: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const player = { ...newPlayers[currentPlayerIndex] };
      const oldPos = player.position;
      let newPos = oldPos + steps;

      if (newPos > TOTAL_SQUARES) {
        addToLog(`${player.name} needs ${TOTAL_SQUARES - oldPos} to win!`);
        setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
        return prevPlayers;
      }

      player.position = newPos;
      newPlayers[currentPlayerIndex] = player;
      
      addToLog(`${player.name} rolled a ${steps} and moved to ${newPos}`);
      
      // Check for win
      if (newPos === TOTAL_SQUARES) {
        setWinner(player);
        setShowWinDialog(true);
        return newPlayers;
      }

      // Check for snakes/ladders after a short delay
      setTimeout(() => {
        handleSpecialSquares(newPos, player.id);
      }, 600);

      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
      return newPlayers;
    });
  }, [currentPlayerIndex, players.length]);

  const handleSpecialSquares = (pos: number, playerId: number) => {
    if (LADDERS[pos]) {
      const target = LADDERS[pos];
      setLastAction({ type: 'ladder', from: pos, to: target });
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: target } : p));
      addToLog(`Lucky! Ladder from ${pos} to ${target}`);
    } else if (SNAKES[pos]) {
      const target = SNAKES[pos];
      setLastAction({ type: 'snake', from: pos, to: target });
      setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: target } : p));
      addToLog(`Oops! Snake from ${pos} to ${target}`);
    }
  };

  const resetGame = () => {
    setPlayers(INITIAL_PLAYERS);
    setCurrentPlayerIndex(0);
    setDiceValue(1);
    setWinner(null);
    setShowWinDialog(false);
    setGameLog(['Game Reset! Good luck.']);
    setLastAction(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 relative z-10">
        {/* Game Board Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full px-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                NEON SNAKES
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Contemporary Edition</p>
            </div>
            <Button variant="outline" size="icon" onClick={resetGame} className="rounded-full border-white/10 hover:bg-white/5 transition-all">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative aspect-square w-full max-w-[600px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
            {/* The Grid */}
            <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-1">
              {Array.from({ length: TOTAL_SQUARES }).map((_, i) => {
                const visualRow = Math.floor(i / BOARD_SIZE);
                const visualCol = i % BOARD_SIZE;
                const actualRow = (BOARD_SIZE - 1) - visualRow;
                const actualCol = actualRow % 2 === 0 ? visualCol : (BOARD_SIZE - 1 - visualCol);
                const displayNum = actualRow * BOARD_SIZE + actualCol + 1;

                const isSnake = SNAKES[displayNum];
                const isLadder = LADDERS[displayNum];

                return (
                  <div 
                    key={displayNum}
                    className={cn(
                      "relative flex items-center justify-center rounded-md text-[10px] font-bold transition-colors",
                      "bg-white/5 border border-white/5",
                      displayNum % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                    )}
                  >
                    <span className="absolute top-1 left-1 opacity-30">{displayNum}</span>
                    
                    {isSnake && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <TrendingDown className="w-4 h-4 text-red-500/40" />
                      </div>
                    )}
                    {isLadder && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500/40" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Players */}
            <AnimatePresence>
              {players.map((player) => {
                const { x, y } = getSquareCoords(player.position);
                return (
                  <motion.div
                    key={player.id}
                    layoutId={`player-${player.id}`}
                    initial={false}
                    animate={{
                      left: `${x * 10 + 5}%`,
                      top: `${y * 10 + 5}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute w-[6%] h-[6%] -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <div 
                      className="w-full h-full rounded-full shadow-lg flex items-center justify-center border-2 border-white/20"
                      style={{ 
                        backgroundColor: player.color,
                        boxShadow: `0 0 15px ${player.color}66`
                      }}
                    >
                      <User className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Visual feedback for snakes/ladders */}
            <AnimatePresence>
              {lastAction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
                >
                  <div className={cn(
                    "px-4 py-2 rounded-full backdrop-blur-md border text-sm font-bold flex items-center gap-2",
                    lastAction.type === 'snake' ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  )}>
                    {lastAction.type === 'snake' ? <TrendingDown className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    {lastAction.type === 'snake' ? 'SNAKE!' : 'LADDER!'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Dices className="w-5 h-5 text-primary" />
                Game Controls
              </CardTitle>
              <CardDescription>Take turns to reach square 100</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/10"
                    style={{ backgroundColor: currentPlayer.color }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{currentPlayer.name}'s Turn</p>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">Active</Badge>
                  </div>
                </div>
                
                <motion.div 
                  key={diceValue}
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="w-12 h-12 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-black shadow-inner"
                >
                  {diceValue}
                </motion.div>
              </div>

              <Button 
                onClick={rollDice} 
                disabled={isRolling || !!winner}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                {isRolling ? 'ROLLING...' : 'ROLL DICE'}
              </Button>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Info className="w-3 h-3" />
                  Live Log
                </div>
                <div className="space-y-2">
                  {gameLog.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1 - (i * 0.2), x: 0 }}
                      className="text-xs py-1 px-2 rounded bg-white/5 border-l-2 border-primary/50"
                    >
                      {log}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {players.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className={cn("text-sm font-medium", currentPlayer.id === p.id ? "text-white" : "text-muted-foreground")}>
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    SQ {p.position}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Win Dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-sm rounded-3xl">
          <DialogHeader className="items-center pt-6">
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4 border border-yellow-500/50">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter">VICTORY!</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              <span className="font-bold text-white">{winner?.name}</span> has conquered the neon board!
            </DialogDescription>
          </DialogHeader>
          <Separator className="bg-white/10" />
          <DialogFooter className="sm:justify-center pb-6">
            <Button onClick={resetGame} className="w-full rounded-xl bg-white text-black hover:bg-white/90 font-bold">
              PLAY AGAIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 text-center pointer-events-none opacity-20">
        <p className="text-[10px] uppercase tracking-[0.5em] font-medium">Designed for the Modern Gamer</p>
      </footer>
    </div>
  );
}
