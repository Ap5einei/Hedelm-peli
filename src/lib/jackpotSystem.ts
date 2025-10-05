// Progressive jackpot system
export interface JackpotState {
  miniJackpot: number;
  midiJackpot: number;
  megaJackpot: number;
  lastWin: { type: 'mini' | 'midi' | 'mega'; amount: number } | null;
}

const INITIAL_JACKPOTS: JackpotState = {
  miniJackpot: 50,
  midiJackpot: 500,
  megaJackpot: 5000,
  lastWin: null,
};

let currentJackpots: JackpotState = { ...INITIAL_JACKPOTS };

export function getJackpots(): JackpotState {
  return { ...currentJackpots };
}

export function contributeToJackpots(betAmount: number): void {
  // 5% of each bet contributes to jackpots
  const contribution = betAmount * 0.05;
  currentJackpots.miniJackpot += contribution * 0.5;
  currentJackpots.midiJackpot += contribution * 0.3;
  currentJackpots.megaJackpot += contribution * 0.2;
}

export function checkJackpotWin(betAmount: number): JackpotState['lastWin'] {
  // Random jackpot trigger chances (very simplified)
  const random = Math.random();
  
  // Higher bets = better jackpot chances
  const betMultiplier = Math.min(betAmount / 10, 5);
  
  if (random < 0.001 * betMultiplier) {
    // Mega jackpot (0.1% base chance)
    const amount = currentJackpots.megaJackpot;
    currentJackpots.megaJackpot = INITIAL_JACKPOTS.megaJackpot;
    currentJackpots.lastWin = { type: 'mega', amount };
    return currentJackpots.lastWin;
  } else if (random < 0.01 * betMultiplier) {
    // Midi jackpot (1% base chance)
    const amount = currentJackpots.midiJackpot;
    currentJackpots.midiJackpot = INITIAL_JACKPOTS.midiJackpot;
    currentJackpots.lastWin = { type: 'midi', amount };
    return currentJackpots.lastWin;
  } else if (random < 0.05 * betMultiplier) {
    // Mini jackpot (5% base chance)
    const amount = currentJackpots.miniJackpot;
    currentJackpots.miniJackpot = INITIAL_JACKPOTS.miniJackpot;
    currentJackpots.lastWin = { type: 'mini', amount };
    return currentJackpots.lastWin;
  }
  
  return null;
}

export function resetJackpots(): void {
  currentJackpots = { ...INITIAL_JACKPOTS };
}
