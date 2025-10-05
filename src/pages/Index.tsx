import { useState } from "react";
import { SlotMachine } from "@/components/SlotMachine";
import { Blackjack } from "@/components/Blackjack";
import { TexasHoldem } from "@/components/TexasHoldem";
import { GameLobby } from "@/components/GameLobby";

const Index = () => {
  const [balance, setBalance] = useState(1000);
  const [currentGame, setCurrentGame] = useState<'lobby' | 'slots' | 'blackjack' | 'holdem'>('lobby');

  return (
    <>
      {currentGame === 'lobby' && (
        <GameLobby balance={balance} onSelectGame={setCurrentGame} />
      )}
      {currentGame === 'slots' && (
        <SlotMachine 
          balance={balance} 
          onBalanceChange={setBalance}
          onBack={() => setCurrentGame('lobby')}
        />
      )}
      {currentGame === 'blackjack' && (
        <Blackjack 
          balance={balance} 
          onBalanceChange={setBalance}
          onBack={() => setCurrentGame('lobby')}
        />
      )}
      {currentGame === 'holdem' && (
        <TexasHoldem 
          balance={balance} 
          onBalanceChange={setBalance}
          onBack={() => setCurrentGame('lobby')}
        />
      )}
    </>
  );
};

export default Index;
