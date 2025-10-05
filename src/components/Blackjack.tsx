import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Coins } from "lucide-react";
import { toast } from "sonner";
import { 
  startNewGame, 
  hit, 
  dealerPlay, 
  determineOutcome,
  type BlackjackHand 
} from "@/lib/blackjackEngine";

interface BlackjackProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  onBack: () => void;
}

export const Blackjack = ({ balance, onBalanceChange, onBack }: BlackjackProps) => {
  const [betAmount] = useState(5);
  const [playerHand, setPlayerHand] = useState<BlackjackHand | null>(null);
  const [dealerHand, setDealerHand] = useState<BlackjackHand | null>(null);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'finished'>('betting');
  const [showDealerSecondCard, setShowDealerSecondCard] = useState(false);

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
    const { playerHand: newPlayerHand, dealerHand: newDealerHand } = startNewGame();
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameState('playing');
    setShowDealerSecondCard(false);

    // Check for immediate blackjack
    if (newPlayerHand.isBlackjack) {
      handleStand(newPlayerHand, newDealerHand);
    }
  };

  const handleHit = () => {
    if (!playerHand) return;
    
    const newPlayerHand = hit(playerHand);
    setPlayerHand(newPlayerHand);

    if (newPlayerHand.isBust) {
      setShowDealerSecondCard(true);
      setGameState('finished');
      toast.error("Yli 21! Hävisit.");
    }
  };

  const handleStand = (pHand = playerHand, dHand = dealerHand) => {
    if (!pHand || !dHand) return;

    setGameState('dealer');
    setShowDealerSecondCard(true);

    // Dealer plays
    setTimeout(() => {
      const finalDealerHand = dealerPlay(dHand);
      setDealerHand(finalDealerHand);
      
      const result = determineOutcome(pHand, finalDealerHand, betAmount);
      
      setTimeout(() => {
        setGameState('finished');
        
        if (result.outcome === 'blackjack') {
          toast.success(`Blackjack! Voitit ${formatEuro(result.payout)}!`);
          onBalanceChange(balance + result.payout);
        } else if (result.outcome === 'win') {
          toast.success(`Voitit ${formatEuro(result.payout)}!`);
          onBalanceChange(balance + result.payout);
        } else if (result.outcome === 'push') {
          toast.info("Tasapeli! Panos palautettu.");
          onBalanceChange(balance + betAmount);
        } else {
          toast.error("Hävisit!");
        }
      }, 1000);
    }, 500);
  };

  const renderCard = (card: { suit: string; rank: string }, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-20 h-28 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center border-2 border-primary/50">
          <div className="text-4xl">🂠</div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className={`w-20 h-28 bg-white rounded-lg flex flex-col items-center justify-between p-2 border-2 border-gray-300 ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="text-xl font-bold">{card.rank}</div>
        <div className="text-3xl">{card.suit}</div>
        <div className="text-xl font-bold transform rotate-180">{card.rank}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
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
            {/* Dealer's hand */}
            <div className="space-y-4">
              <div className="text-xl font-semibold text-center">
                Jakaja {dealerHand && showDealerSecondCard && `(${dealerHand.value})`}
              </div>
              <div className="flex justify-center gap-2">
                {dealerHand?.cards.map((card, idx) => (
                  <div key={idx}>
                    {renderCard(card, idx === 1 && !showDealerSecondCard)}
                  </div>
                ))}
              </div>
            </div>

            {/* Player's hand */}
            <div className="space-y-4">
              <div className="text-xl font-semibold text-center">
                Sinä {playerHand && `(${playerHand.value})`}
                {playerHand?.isBlackjack && " - BLACKJACK! 🎉"}
                {playerHand?.isBust && " - YLI! 💥"}
              </div>
              <div className="flex justify-center gap-2">
                {playerHand?.cards.map((card, idx) => (
                  <div key={idx}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {gameState === 'betting' && (
                <Button onClick={handleDeal} size="lg" className="min-w-32">
                  Jaa kortit ({formatEuro(betAmount)})
                </Button>
              )}
              
              {gameState === 'playing' && (
                <>
                  <Button onClick={handleHit} size="lg" variant="default">
                    Kortti
                  </Button>
                  <Button onClick={() => handleStand()} size="lg" variant="secondary">
                    Jää
                  </Button>
                </>
              )}

              {gameState === 'finished' && (
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
