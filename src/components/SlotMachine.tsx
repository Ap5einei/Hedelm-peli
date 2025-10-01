import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { spinReels, type Symbol, type ReelSet, type GameStats, calculateRTP, getAllSymbols } from "@/lib/gameEngine";
import { toast } from "sonner";
import { Coins, TrendingUp, BarChart3, Zap } from "lucide-react";

const INITIAL_REELS: ReelSet = [
  ['🍒', '🍋', '🍊'],
  ['🍋', '🍇', '🍒'],
  ['🍊', '🍒', '🍋'],
  ['🍇', '🍊', '💎'],
  ['🍒', '🍋', '🍇'],
];

export const SlotMachine = () => {
  const [reels, setReels] = useState<ReelSet>(INITIAL_REELS);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalSpins: 0,
    totalWagered: 0,
    totalWon: 0,
    rtp: 0
  });

  const handleSpin = async () => {
    if (balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setBalance(prev => prev - betAmount);
    setLastWin(0);
    setWinningLines([]);

    // Animate spinning with random symbols
    const allSymbols = getAllSymbols();
    const spinDuration = 2000;
    const interval = setInterval(() => {
      const tempReels: ReelSet = [
        [allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol],
        [allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol],
        [allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol],
        [allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol],
        [allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol, allSymbols[Math.floor(Math.random() * 7)] as Symbol],
      ];
      setReels(tempReels);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      
      // Get actual result from game engine
      const result = spinReels(betAmount);
      setReels(result.reels);
      
      if (result.isWin) {
        setBalance(prev => prev + result.winAmount);
        setLastWin(result.winAmount);
        setWinningLines(result.winLines.map(w => w.line));
        
        const lineText = result.winLines.length === 1 
          ? `Line ${result.winLines[0].line}` 
          : `${result.winLines.length} lines`;
        
        toast.success(`${lineText} - Won ${result.winAmount} coins!`, {
          duration: 3000,
        });
      } else {
        toast.info("No win this time. Try again!");
      }

      // Update stats
      const newStats = {
        totalSpins: stats.totalSpins + 1,
        totalWagered: stats.totalWagered + betAmount,
        totalWon: stats.totalWon + result.winAmount,
        rtp: 0
      };
      newStats.rtp = calculateRTP(newStats);
      setStats(newStats);

      setIsSpinning(false);
    }, spinDuration);
  };

  const adjustBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, betAmount + amount));
    setBetAmount(newBet);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-4 bg-card border-border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Coins className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-foreground">{balance}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Won</p>
              <p className="text-2xl font-bold text-success">{stats.totalWon}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RTP</p>
              <p className="text-2xl font-bold text-accent">
                {stats.totalSpins > 0 ? `${stats.rtp.toFixed(1)}%` : '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Slot Machine */}
      <Card className="p-4 md:p-8 bg-gradient-to-br from-card via-card to-card/50 border-2 border-primary/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="space-y-4 md:space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              5 Kelaa × 3 Riviä
            </h1>
            <p className="text-muted-foreground mt-2">Classic Slot Machine</p>
          </div>

          {/* Win Lines Indicator */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((line) => (
              <div
                key={line}
                className={`
                  px-3 py-1 rounded-full text-xs font-bold transition-all
                  ${winningLines.includes(line)
                    ? 'bg-secondary text-background animate-pulse-win'
                    : 'bg-muted/30 text-muted-foreground'
                  }
                `}
              >
                Line {line}
              </div>
            ))}
          </div>

          {/* Reels - 5x3 Grid */}
          <div className="relative">
            {/* Win line overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {winningLines.includes(1) && (
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-secondary/50 -translate-y-1/2" />
              )}
              {winningLines.includes(2) && (
                <div className="absolute top-[16.66%] left-0 right-0 h-1 bg-secondary/50" />
              )}
              {winningLines.includes(3) && (
                <div className="absolute bottom-[16.66%] left-0 right-0 h-1 bg-secondary/50" />
              )}
            </div>

            <div className="flex justify-center gap-1 md:gap-2">
              {reels.map((reel, reelIndex) => (
                <div key={reelIndex} className="flex flex-col gap-1 md:gap-2">
                  {reel.map((symbol, rowIndex) => (
                    <div
                      key={`${reelIndex}-${rowIndex}`}
                      className={`
                        w-14 h-14 md:w-20 md:h-20 flex items-center justify-center
                        text-3xl md:text-5xl
                        bg-gradient-to-br from-muted to-muted/50
                        border-2 border-border rounded-lg md:rounded-xl
                        shadow-lg
                        ${isSpinning ? 'animate-pulse' : ''}
                        ${lastWin > 0 && !isSpinning ? 'ring-2 ring-secondary' : ''}
                        transition-all duration-200
                      `}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Last Win Display */}
          {lastWin > 0 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-secondary to-accent rounded-full">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-background" />
                <p className="text-xl md:text-2xl font-bold text-background">
                  WIN: {lastWin} coins!
                </p>
              </div>
            </div>
          )}

          {/* Bet Controls */}
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <Button
              onClick={() => adjustBet(-5)}
              variant="outline"
              size="lg"
              disabled={isSpinning}
              className="border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              -5
            </Button>
            <div className="text-center min-w-[100px] md:min-w-[120px]">
              <p className="text-xs md:text-sm text-muted-foreground">Panos</p>
              <p className="text-2xl md:text-3xl font-bold text-secondary">{betAmount}</p>
            </div>
            <Button
              onClick={() => adjustBet(5)}
              variant="outline"
              size="lg"
              disabled={isSpinning}
              className="border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              +5
            </Button>
          </div>

          {/* Spin Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || balance < betAmount}
              size="lg"
              className="w-full md:w-64 h-14 md:h-16 text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50"
            >
              {isSpinning ? 'PYÖRII...' : 'PYÖRÄYTÄ'}
            </Button>
          </div>

          {/* Game Stats */}
          <div className="pt-4 md:pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pyöräytykset</p>
                <p className="text-lg md:text-xl font-bold text-foreground">{stats.totalSpins}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Panostettu</p>
                <p className="text-lg md:text-xl font-bold text-foreground">{stats.totalWagered}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Voitto/Tappio</p>
                <p className={`text-lg md:text-xl font-bold ${stats.totalWon - stats.totalWagered >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.totalWon - stats.totalWagered >= 0 ? '+' : ''}{stats.totalWon - stats.totalWagered}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Voittoprosentti</p>
                <p className="text-lg md:text-xl font-bold text-accent">
                  {stats.totalSpins > 0 ? ((stats.totalWon / stats.totalWagered * 100) || 0).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Win Lines Guide */}
      <Card className="p-4 md:p-6 bg-card/50 border-border backdrop-blur-sm">
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Voittolinjat</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold">1</span>
            <span className="text-sm">━━━━━ Keskellä</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold">2</span>
            <span className="text-sm">━━━━━ Ylhäällä</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold">3</span>
            <span className="text-sm">━━━━━ Alhaalla</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold">4</span>
            <span className="text-sm">╲╱╲╱╲ V-muoto</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <span className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold">5</span>
            <span className="text-sm">╱╲╱╲╱ ^-muoto</span>
          </div>
        </div>
      </Card>

      {/* Payout Table */}
      <Card className="p-4 md:p-6 bg-card/50 border-border backdrop-blur-sm">
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Voittotaulukko</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { symbol: '7️⃣', payout: '100x (5)', multiplier: '10x (4)' },
            { symbol: '💎', payout: '50x (5)', multiplier: '10x (4)' },
            { symbol: '🔔', payout: '20x (5)', multiplier: '10x (4)' },
            { symbol: '🍇', payout: '10x (5)', multiplier: '5x (4)' },
            { symbol: '🍊', payout: '5x (5)', multiplier: '5x (4)' },
            { symbol: '🍋', payout: '3x (5)', multiplier: '5x (4)' },
            { symbol: '🍒', payout: '2x (5)', multiplier: '5x (4)' },
          ].map((item) => (
            <div key={item.symbol} className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-3xl mb-1">{item.symbol}</div>
              <div className="text-xs font-bold text-secondary">{item.payout}</div>
              <div className="text-xs text-muted-foreground">{item.multiplier}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          * 3 samaa symbolia: 1x panos • 4 samaa: 5-10x • 5 samaa: täysi voitto
        </p>
      </Card>
    </div>
  );
};
