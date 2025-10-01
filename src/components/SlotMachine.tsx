import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { spinReels, type Symbol, type GameStats, calculateRTP } from "@/lib/gameEngine";
import { toast } from "sonner";
import { Coins, TrendingUp, BarChart3 } from "lucide-react";

export const SlotMachine = () => {
  const [reels, setReels] = useState<[Symbol, Symbol, Symbol]>(['🍒', '🍋', '🍊']);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
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

    // Animate spinning
    const spinDuration = 2000;
    const interval = setInterval(() => {
      setReels([
        ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔'][Math.floor(Math.random() * 7)] as Symbol,
        ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔'][Math.floor(Math.random() * 7)] as Symbol,
        ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔'][Math.floor(Math.random() * 7)] as Symbol,
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      
      // Get actual result from game engine
      const result = spinReels(betAmount);
      setReels(result.reels);
      
      if (result.isWin) {
        setBalance(prev => prev + result.winAmount);
        setLastWin(result.winAmount);
        toast.success(`${result.winLine} - Won ${result.winAmount} coins!`, {
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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <Card className="p-8 bg-gradient-to-br from-card via-card to-card/50 border-2 border-primary/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              iGaming Slot Machine
            </h1>
            <p className="text-muted-foreground mt-2">Modular Game Engine Demo</p>
          </div>

          {/* Reels */}
          <div className="flex justify-center gap-4">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`
                  w-32 h-32 flex items-center justify-center text-6xl
                  bg-gradient-to-br from-muted to-muted/50
                  border-4 border-border rounded-2xl
                  shadow-lg
                  ${isSpinning ? 'animate-pulse' : ''}
                  ${lastWin > 0 && !isSpinning ? 'animate-pulse-win ring-4 ring-secondary' : ''}
                `}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Last Win Display */}
          {lastWin > 0 && (
            <div className="text-center">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-full">
                <p className="text-2xl font-bold text-background">
                  WIN: {lastWin} coins!
                </p>
              </div>
            </div>
          )}

          {/* Bet Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => adjustBet(-10)}
              variant="outline"
              size="lg"
              disabled={isSpinning}
              className="border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              -10
            </Button>
            <div className="text-center min-w-[120px]">
              <p className="text-sm text-muted-foreground">Bet Amount</p>
              <p className="text-3xl font-bold text-secondary">{betAmount}</p>
            </div>
            <Button
              onClick={() => adjustBet(10)}
              variant="outline"
              size="lg"
              disabled={isSpinning}
              className="border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              +10
            </Button>
          </div>

          {/* Spin Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSpin}
              disabled={isSpinning || balance < betAmount}
              size="lg"
              className="w-64 h-16 text-2xl font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50"
            >
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </Button>
          </div>

          {/* Game Stats */}
          <div className="pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Spins</p>
                <p className="text-xl font-bold text-foreground">{stats.totalSpins}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Wagered</p>
                <p className="text-xl font-bold text-foreground">{stats.totalWagered}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-xl font-bold ${stats.totalWon - stats.totalWagered >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.totalWon - stats.totalWagered}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold text-accent">
                  {stats.totalSpins > 0 ? ((stats.totalWon / stats.totalWagered * 100) || 0).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payout Table */}
      <Card className="p-6 bg-card/50 border-border backdrop-blur-sm">
        <h3 className="text-xl font-bold text-foreground mb-4">Payout Table</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { symbol: '7️⃣', payout: '100x' },
            { symbol: '💎', payout: '50x' },
            { symbol: '🔔', payout: '20x' },
            { symbol: '🍇', payout: '10x' },
            { symbol: '🍊', payout: '5x' },
            { symbol: '🍋', payout: '3x' },
            { symbol: '🍒', payout: '2x' },
          ].map((item) => (
            <div key={item.symbol} className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-3xl mb-1">{item.symbol}</div>
              <div className="text-sm font-bold text-secondary">{item.payout}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          * Two matching symbols pays 0.5x • Theoretical RTP: ~96.5%
        </p>
      </Card>
    </div>
  );
};
