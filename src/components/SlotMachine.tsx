import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { spinReels, type GameResult, type ReelSet, type Symbol } from "@/lib/gameEngine";
import { WinLineOverlay } from "./WinLineOverlay";
import { contributeToJackpots, checkJackpotWin, getJackpots } from "@/lib/jackpotSystem";
import { ArrowLeft, Coins, Gift } from "lucide-react";

const INITIAL_REELS: ReelSet = [
  ['🍒', '🍋', '🍊'],
  ['🍇', '🔔', '💎'],
  ['7️⃣', '🍒', '🍋'],
  ['🍊', '🍇', '🔔'],
  ['💎', '7️⃣', '🍒'],
];

interface SlotMachineProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onBack: () => void;
}

export const SlotMachine = ({ balance, onBalanceChange, onBack }: SlotMachineProps) => {
  const [betAmount, setBetAmount] = useState(5);
  const [reels, setReels] = useState<ReelSet>(INITIAL_REELS);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [totalSpins, setTotalSpins] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [totalWon, setTotalWon] = useState(0);
  const [activeWinLines, setActiveWinLines] = useState<number[]>([]);
  const [winningPositions, setWinningPositions] = useState<Set<string>>(new Set());
  const [bonusSpins, setBonusSpins] = useState(0);
  const [jackpots, setJackpots] = useState(getJackpots());

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpots(getJackpots());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    
    const isBonusSpin = bonusSpins > 0;
    
    if (!isBonusSpin && balance < betAmount) {
      toast.error("Ei tarpeeksi saldoa!");
      return;
    }

    setIsSpinning(true);
    
    if (!isBonusSpin) {
      onBalanceChange(balance - betAmount);
      contributeToJackpots(betAmount);
    } else {
      setBonusSpins(bonusSpins - 1);
      toast.info(`🎁 Ilmaiskierros! ${bonusSpins - 1} jäljellä`);
    }
    
    setActiveWinLines([]);
    setWinningPositions(new Set());

    // Simulate spinning animation
    const spinInterval = setInterval(() => {
      const tempReels: ReelSet = [
        ['🍒', '🍋', '🍊'],
        ['🍇', '🔔', '💎'],
        ['7️⃣', '🍒', '🍋'],
        ['🍊', '🍇', '🔔'],
        ['💎', '7️⃣', '🍒'],
      ];
      setReels(tempReels);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const result = spinReels(betAmount);
      setReels(result.reels);
      setLastResult(result);
      
      setTotalSpins(totalSpins + 1);
      setTotalWagered(totalWagered + betAmount);

      // Check for bonus trigger (3+ scatter symbols)
      const scatterCount = result.reels.flat().filter(s => s === '💎').length;
      if (scatterCount >= 3 && !isBonusSpin) {
        const freeSpins = scatterCount === 3 ? 5 : scatterCount === 4 ? 10 : 15;
        setBonusSpins(bonusSpins + freeSpins);
        toast.success(`🎁 Bonus! ${freeSpins} ilmaiskierrosta!`, {
          description: `${scatterCount} scatter-symbolia`
        });
      }

      // Check for jackpot
      if (!isBonusSpin) {
        const jackpotWin = checkJackpotWin(betAmount);
        if (jackpotWin) {
          toast.success(`🎰 JACKPOT! ${formatEuro(jackpotWin.amount)}`, {
            description: `${jackpotWin.type.toUpperCase()} Jackpot`,
            duration: 10000,
          });
          onBalanceChange(balance + jackpotWin.amount);
          setJackpots(getJackpots());
        }
      }

      if (result.isWin) {
        onBalanceChange(balance + result.winAmount);
        setTotalWon(totalWon + result.winAmount);
        
        const winLineNumbers = result.winLines.map(w => w.line);
        setActiveWinLines(winLineNumbers);
        
        const positions = new Set<string>();
        result.winLines.forEach(winLine => {
          winLine.positions.forEach((rowIndex, reelIndex) => {
            positions.add(`${reelIndex}-${rowIndex}`);
          });
        });
        setWinningPositions(positions);

        toast.success(`Voitto! ${formatEuro(result.winAmount)}`, {
          description: `Voittolinjat: ${winLineNumbers.join(', ')}`
        });
      }

      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header with back button and balance */}
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="ghost" size="lg">
            <ArrowLeft className="mr-2" />
            Takaisin
          </Button>
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <Coins className="w-6 h-6 text-accent" />
            <span>{formatEuro(balance)}</span>
          </div>
        </div>

        {/* Jackpot display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 rounded-lg border border-amber-500/30">
            <div className="text-amber-300 text-sm">Mini Jackpot</div>
            <div className="text-xl font-bold text-amber-200">{formatEuro(jackpots.miniJackpot)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-4 rounded-lg border border-orange-500/30">
            <div className="text-orange-300 text-sm">Midi Jackpot</div>
            <div className="text-xl font-bold text-orange-200">{formatEuro(jackpots.midiJackpot)}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-4 rounded-lg border border-red-500/30">
            <div className="text-red-300 text-sm">Mega Jackpot</div>
            <div className="text-xl font-bold text-red-200">{formatEuro(jackpots.megaJackpot)}</div>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-card/80 to-card/60 shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              🎰 Slot Machine 🎰
            </CardTitle>
            <CardDescription className="text-lg">
              5 kelaa • 3 riviä • 5 voittolinjaa
            </CardDescription>
            {bonusSpins > 0 && (
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-accent animate-pulse">
                <Gift className="w-6 h-6" />
                {bonusSpins} ilmaiskierrosta jäljellä!
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6 p-4 md:p-8">
            {/* Bet Controls */}
            <div className="flex justify-center items-center gap-4 p-4 bg-background/50 rounded-lg border border-primary/10">
              <span className="text-muted-foreground">Panos:</span>
              <div className="flex gap-2">
                {[1, 5, 10, 20, 50].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    variant={betAmount === amount ? "default" : "outline"}
                    size="sm"
                    className="min-w-[60px]"
                  >
                    {formatEuro(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reels Container with Win Lines */}
            <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-xl border-2 border-primary/20">
              {/* Win line overlays */}
              {activeWinLines.map((lineNum) => (
                <WinLineOverlay key={lineNum} lineNumber={lineNum} isActive={true} />
              ))}

              <div className="flex justify-center gap-2">
                {reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="flex flex-col gap-2">
                    {reel.map((symbol, rowIndex) => {
                      const isWinning = winningPositions.has(`${reelIndex}-${rowIndex}`);
                      return (
                        <div
                          key={`${reelIndex}-${rowIndex}`}
                          className={`
                            w-20 h-20 flex items-center justify-center text-5xl
                            bg-gradient-to-br from-background to-background/80
                            border-2 rounded-xl shadow-lg transition-all duration-300
                            ${isSpinning ? 'animate-pulse border-primary/50' : 'border-border'}
                            ${isWinning && !isSpinning ? 'ring-4 ring-accent border-accent shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse' : ''}
                          `}
                        >
                          {symbol}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Spin Button */}
            <Button
              onClick={handleSpin}
              disabled={isSpinning || (bonusSpins === 0 && balance < betAmount)}
              size="lg"
              className="w-full md:w-auto px-12 py-6 text-xl font-bold"
            >
              {isSpinning ? "Pyörii..." : bonusSpins > 0 ? "Ilmaiskierros! 🎁" : `Pyöräytä (${formatEuro(betAmount)})`}
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background/50 rounded-lg border border-primary/10">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Pyöräytykset</div>
                <div className="text-xl font-bold">{totalSpins}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Panostettu</div>
                <div className="text-xl font-bold">{formatEuro(totalWagered)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Voitettu</div>
                <div className="text-xl font-bold text-accent">{formatEuro(totalWon)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">RTP</div>
                <div className="text-xl font-bold">
                  {totalWagered > 0 ? `${((totalWon / totalWagered) * 100).toFixed(1)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Payout Table */}
            <Card className="bg-background/30">
              <CardHeader>
                <CardTitle className="text-xl">Voittotaulukko</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {[
                    { symbol: '7️⃣', name: 'Seiska', payout: 100 },
                    { symbol: '💎', name: 'Scatter/Bonus', payout: 50 },
                    { symbol: '🔔', name: 'Kello', payout: 20 },
                    { symbol: '🍇', name: 'Viinirypäleet', payout: 10 },
                    { symbol: '🍊', name: 'Appelsiini', payout: 5 },
                    { symbol: '🍋', name: 'Sitruuna', payout: 3 },
                    { symbol: '🍒', name: 'Kirsikka', payout: 2 },
                  ].map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-2xl">{item.symbol}</span>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                        <div className="font-bold">×{item.payout}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground space-y-1 text-center">
                  <p>3 samaa: ×1 • 4 samaa: ×5 • 5 samaa: ×kerroin</p>
                  <p className="text-accent">💎 3+ Scatteria = Ilmaiskierrokset!</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
