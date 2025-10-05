// Blackjack game engine with proper card logic
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface BlackjackHand {
  cards: Card[];
  value: number;
  isSoft: boolean; // Has ace counted as 11
  isBlackjack: boolean;
  isBust: boolean;
}

export interface BlackjackResult {
  playerHand: BlackjackHand;
  dealerHand: BlackjackHand;
  outcome: 'win' | 'loss' | 'push' | 'blackjack' | 'ongoing';
  payout: number;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function getRankValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: getRankValue(rank) });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const j = Math.floor((array[0] / (0xffffffff + 1)) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateHandValue(cards: Card[]): { value: number; isSoft: boolean } {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.value;
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return { value, isSoft: aces > 0 };
}

function createHand(cards: Card[]): BlackjackHand {
  const { value, isSoft } = calculateHandValue(cards);
  return {
    cards,
    value,
    isSoft,
    isBlackjack: cards.length === 2 && value === 21,
    isBust: value > 21,
  };
}

let gameDeck: Card[] = [];

export function startNewGame(): { playerHand: BlackjackHand; dealerHand: BlackjackHand } {
  gameDeck = shuffleDeck([...createDeck(), ...createDeck()]); // Use 2 decks
  
  const playerCards = [gameDeck.pop()!, gameDeck.pop()!];
  const dealerCards = [gameDeck.pop()!, gameDeck.pop()!];

  return {
    playerHand: createHand(playerCards),
    dealerHand: createHand(dealerCards),
  };
}

export function hit(hand: BlackjackHand): BlackjackHand {
  const newCards = [...hand.cards, gameDeck.pop()!];
  return createHand(newCards);
}

export function dealerPlay(dealerHand: BlackjackHand): BlackjackHand {
  let currentHand = dealerHand;
  
  while (currentHand.value < 17) {
    currentHand = hit(currentHand);
  }
  
  return currentHand;
}

export function determineOutcome(
  playerHand: BlackjackHand,
  dealerHand: BlackjackHand,
  betAmount: number
): BlackjackResult {
  let outcome: BlackjackResult['outcome'];
  let payout = 0;

  if (playerHand.isBust) {
    outcome = 'loss';
    payout = 0;
  } else if (playerHand.isBlackjack && !dealerHand.isBlackjack) {
    outcome = 'blackjack';
    payout = betAmount * 2.5;
  } else if (dealerHand.isBust || playerHand.value > dealerHand.value) {
    outcome = 'win';
    payout = betAmount * 2;
  } else if (playerHand.value === dealerHand.value) {
    outcome = 'push';
    payout = betAmount;
  } else {
    outcome = 'loss';
    payout = 0;
  }

  return {
    playerHand,
    dealerHand,
    outcome,
    payout,
  };
}
