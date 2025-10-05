import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Zap, Sparkles } from "lucide-react";
import { getJackpots } from "@/lib/jackpotSystem";

interface GameLobbyProps {
  balance: number;
  onSelectGame: (game: 'slots' | 'blackjack' | 'holdem') => void;
}

export const GameLobby = ({ balance, onSelectGame }: GameLobbyProps) => {
  const jackpots = getJackpots();

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with balance and jackpots */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Casino Royale
          </h1>
          <div className="flex justify-center items-center gap-2 text-2xl font-semibold">
            <Coins className="w-6 h-6 text-accent" />
            <span>Saldo: {formatEuro(balance)}</span>
          </div>
          
          {/* Jackpot display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 rounded-lg border border-amber-500/30">
              <div className="text-amber-300 text-sm">Mini Jackpot</div>
              <div className="text-2xl font-bold text-amber-200">{formatEuro(jackpots.miniJackpot)}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-4 rounded-lg border border-orange-500/30">
              <div className="text-orange-300 text-sm">Midi Jackpot</div>
              <div className="text-2xl font-bold text-orange-200">{formatEuro(jackpots.midiJackpot)}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-4 rounded-lg border border-red-500/30">
              <div className="text-red-300 text-sm">Mega Jackpot</div>
              <div className="text-2xl font-bold text-red-200">{formatEuro(jackpots.megaJackpot)}</div>
            </div>
          </div>
        </div>

        {/* Game selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slots */}
          <Card className="bg-gradient-to-br from-card/80 to-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-accent" />
                    Slotit
                  </CardTitle>
                  <CardDescription className="mt-2">
                    5 kelaa, 3 riviä, 5 voittolinjaa
                  </CardDescription>
                </div>
                <div className="text-3xl">🎰</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Bonus-kierrokset</li>
                <li>• Ilmaiskierrokset</li>
                <li>• Jackpot-mahdollisuus</li>
                <li>• RTP: ~96.5%</li>
              </ul>
              <Button 
                onClick={() => onSelectGame('slots')}
                className="w-full"
                size="lg"
              >
                Pelaa Slotteja
              </Button>
            </CardContent>
          </Card>

          {/* Blackjack */}
          <Card className="bg-gradient-to-br from-card/80 to-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Zap className="w-6 h-6 text-accent" />
                    Blackjack
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Klassinen korttipeli
                  </CardDescription>
                </div>
                <div className="text-3xl">🃏</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tavoite: 21 pistettä</li>
                <li>• Blackjack: 2.5x payout</li>
                <li>• Strategiapeli</li>
                <li>• RTP: ~99.5%</li>
              </ul>
              <Button 
                onClick={() => onSelectGame('blackjack')}
                className="w-full"
                size="lg"
              >
                Pelaa Blackjackia
              </Button>
            </CardContent>
          </Card>

          {/* Texas Hold'em */}
          <Card className="bg-gradient-to-br from-card/80 to-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Coins className="w-6 h-6 text-accent" />
                    Texas Hold'em
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Pokerin kuningas
                  </CardDescription>
                </div>
                <div className="text-3xl">♠️</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Heads-up vastaan jakajaa</li>
                <li>• 5 yhteistä korttia</li>
                <li>• Käsiarvot määrittävät voiton</li>
                <li>• RTP: ~98%</li>
              </ul>
              <Button 
                onClick={() => onSelectGame('holdem')}
                className="w-full"
                size="lg"
              >
                Pelaa Hold'emia
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
