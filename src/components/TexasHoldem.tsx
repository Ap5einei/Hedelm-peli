import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Coins } from "lucide-react";
import { toast } from "sonner";
import {
  startHoldemGame,
  dealFlop,
  dealTurn,
  dealRiver,
  showdown,
  type HoldemGameState,
  type Card as PokerCard,
} from "@/lib/texasHoldemEngine";

interface TexasHoldemProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onBack: () => void;
}

export const TexasHoldem = ({ balance, onBalanceChange, onBack }: TexasHoldemProps) => {
  const [betAmount] = useState(5);
  const [gameState, setGameState] = useState<HoldemGameState | null>(null);
  const [stage, setStage] = useState<'betting' | 'playing' | 'showdown'>('betting');
  const [showDealerCards, setShowDealerCards] = useState(false);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleDeal = () => {
    if (balance < betAmount) {
      toast.error("Ei tarpeeksi rahaa!");
      return;
    }

    onBalanceChange(balance - betAmount);
    const newGame = startHoldemGame(betAmount);
    setGameState(newGame);
    setStage('playing');
    setShowDealerCards(false);
  };

  const handleNextStage = () => {
    if (!gameState) return;

    if (gameState.stage === 'preflop') {
      setGameState(dealFlop(gameState));
    } else if (gameState.stage === 'flop') {
      setGameState(dealTurn(gameState));
    } else if (gameState.stage === 'turn') {
      setGameState(dealRiver(gameState));
    } else if (gameState.stage === 'river') {
      handleShowdown();
    }
  };

  const handleShowdown = () => {
    if (!gameState) return;

    setShowDealerCards(true);
    const result = showdown(gameState);
    
    setTimeout(() => {
      setStage('showdown');
      
      if (result.outcome === 'win') {
        toast.success(`Voitit ${formatEuro(result.payout)}! ${result.playerHand.name}`);
        onBalanceChange(balance + result.payout);
      } else if (result.outcome === 'tie') {
        toast.info(`Tasapeli! ${formatEuro(result.payout)} palautettu.`);
        onBalanceChange(balance + result.payout);
      } else {
        toast.error(`Hävisit! Jakajan käsi: ${result.dealerHand.name}`);
      }
    }, 500);
  };

  const renderCard = (card: PokerCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center border-2 border-primary/50">
          <div className="text-3xl">🂠</div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className={`w-16 h-24 bg-white rounded-lg flex flex-col items-center justify-between p-1.5 border-2 border-gray-300 ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="text-lg font-bold">{card.rank}</div>
        <div className="text-2xl">{card.suit}</div>
        <div className="text-lg font-bold transform rotate-180">{card.rank}</div>
      </div>
    );
  };

  const getStageText = () => {
    if (!gameState) return '';
    switch (gameState.stage) {
      case 'preflop': return 'Pre-Flop';
      case 'flop': return 'Flop';
      case 'turn': return 'Turn';
      case 'river': return 'River';
      case 'showdown': return 'Showdown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
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

        <Card className="bg-gradient-to-br from-green-900/40 to-green-950/40 border-2 border-primary/30">
          <CardContent className="p-8 space-y-8">
            {/* Stage indicator */}
            {gameState && (
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{getStageText()}</div>
                <div className="text-lg text-muted-foreground">Potti: {formatEuro(gameState.pot)}</div>
              </div>
            )}

            {/* Dealer's cards */}
            <div className="space-y-4">
              <div className="text-xl font-semibold text-center">Jakaja</div>
              <div className="flex justify-center gap-2">
                {gameState?.dealerCards.map((card, idx) => (
                  <div key={idx}>{renderCard(card, !showDealerCards)}</div>
                ))}
              </div>
            </div>

            {/* Community cards */}
            {gameState && gameState.communityCards.length > 0 && (
              <div className="space-y-4">
                <div className="text-xl font-semibold text-center">Yhteiskortit</div>
                <div className="flex justify-center gap-2">
                  {gameState.communityCards.map((card, idx) => (
                    <div key={idx}>{renderCard(card)}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Player's cards */}
            <div className="space-y-4">
              <div className="text-xl font-semibold text-center">Sinä</div>
              <div className="flex justify-center gap-2">
                {gameState?.playerCards.map((card, idx) => (
                  <div key={idx}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {stage === 'betting' && (
                <Button onClick={handleDeal} size="lg" className="min-w-32">
                  Aloita peli ({formatEuro(betAmount)})
                </Button>
              )}
              
              {stage === 'playing' && gameState && (
                <Button onClick={handleNextStage} size="lg">
                  {gameState.stage === 'river' ? 'Showdown' : 'Jatka'}
                </Button>
              )}

              {stage === 'showdown' && (
                <Button onClick={handleDeal} size="lg">
                  Uusi jako
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
