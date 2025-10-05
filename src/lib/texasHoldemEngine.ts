// Texas Hold'em poker engine (simplified heads-up vs dealer)
import type { Suit, Rank, Card } from './blackjackEngine';

export type { Suit, Rank, Card };

export type HandRank =
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_of_a_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_of_a_kind'
  | 'straight_flush'
  | 'royal_flush';

export interface PokerHand {
  cards: Card[];
  rank: HandRank;
  value: number;
  name: string;
}

export interface HoldemGameState {
  playerCards: Card[];
  dealerCards: Card[];
  communityCards: Card[];
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  pot: number;
}

export interface HoldemResult {
  playerHand: PokerHand;
  dealerHand: PokerHand;
  outcome: 'win' | 'loss' | 'tie';
  payout: number;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const value = rank === 'A' ? 14 : ['J', 'Q', 'K'].includes(rank) ? 
        10 + ['J', 'Q', 'K'].indexOf(rank) + 1 : parseInt(rank);
      deck.push({ suit, rank, value });
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

let gameDeck: Card[] = [];

export function startHoldemGame(betAmount: number): HoldemGameState {
  gameDeck = shuffleDeck(createDeck());
  
  return {
    playerCards: [gameDeck.pop()!, gameDeck.pop()!],
    dealerCards: [gameDeck.pop()!, gameDeck.pop()!],
    communityCards: [],
    stage: 'preflop',
    pot: betAmount * 2,
  };
}

export function dealFlop(state: HoldemGameState): HoldemGameState {
  return {
    ...state,
    communityCards: [gameDeck.pop()!, gameDeck.pop()!, gameDeck.pop()!],
    stage: 'flop',
  };
}

export function dealTurn(state: HoldemGameState): HoldemGameState {
  return {
    ...state,
    communityCards: [...state.communityCards, gameDeck.pop()!],
    stage: 'turn',
  };
}

export function dealRiver(state: HoldemGameState): HoldemGameState {
  return {
    ...state,
    communityCards: [...state.communityCards, gameDeck.pop()!],
    stage: 'river',
  };
}

function evaluateHand(playerCards: Card[], communityCards: Card[]): PokerHand {
  const allCards = [...playerCards, ...communityCards];
  
  // Simplified hand evaluation - check for basic patterns
  const ranks = allCards.map(c => c.value).sort((a, b) => b - a);
  const suits = allCards.map(c => c.suit);
  
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suits.some(suit => suits.filter(s => s === suit).length >= 5);
  
  // Check for straight
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
  let isStraight = false;
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      isStraight = true;
      break;
    }
  }
  
  let rank: HandRank = 'high_card';
  let name = 'High Card';
  let value = Math.max(...ranks);
  
  if (isStraight && isFlush) {
    rank = uniqueRanks[0] === 14 ? 'royal_flush' : 'straight_flush';
    name = rank === 'royal_flush' ? 'Royal Flush' : 'Straight Flush';
    value = 9000;
  } else if (counts[0] === 4) {
    rank = 'four_of_a_kind';
    name = 'Four of a Kind';
    value = 8000;
  } else if (counts[0] === 3 && counts[1] === 2) {
    rank = 'full_house';
    name = 'Full House';
    value = 7000;
  } else if (isFlush) {
    rank = 'flush';
    name = 'Flush';
    value = 6000;
  } else if (isStraight) {
    rank = 'straight';
    name = 'Straight';
    value = 5000;
  } else if (counts[0] === 3) {
    rank = 'three_of_a_kind';
    name = 'Three of a Kind';
    value = 4000;
  } else if (counts[0] === 2 && counts[1] === 2) {
    rank = 'two_pair';
    name = 'Two Pair';
    value = 3000;
  } else if (counts[0] === 2) {
    rank = 'pair';
    name = 'Pair';
    value = 2000;
  }
  
  return { cards: allCards, rank, value, name };
}

export function showdown(state: HoldemGameState): HoldemResult {
  const playerHand = evaluateHand(state.playerCards, state.communityCards);
  const dealerHand = evaluateHand(state.dealerCards, state.communityCards);
  
  let outcome: 'win' | 'loss' | 'tie';
  let payout = 0;
  
  if (playerHand.value > dealerHand.value) {
    outcome = 'win';
    payout = state.pot;
  } else if (playerHand.value < dealerHand.value) {
    outcome = 'loss';
    payout = 0;
  } else {
    outcome = 'tie';
    payout = state.pot / 2;
  }
  
  return { playerHand, dealerHand, outcome, payout };
}
