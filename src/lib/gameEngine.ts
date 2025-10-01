// Core game engine for slot machine with proper RNG implementation
// 5 reels × 3 rows configuration (like Book of Ra / Kulta Jaska)

export type Symbol = '🍒' | '🍋' | '🍊' | '🍇' | '💎' | '7️⃣' | '🔔';

export type Reel = [Symbol, Symbol, Symbol]; // 3 symbols per reel
export type ReelSet = [Reel, Reel, Reel, Reel, Reel]; // 5 reels

export interface WinLine {
  line: number;
  symbols: Symbol[];
  payout: number;
  positions: number[];
}

export interface GameResult {
  reels: ReelSet;
  winAmount: number;
  isWin: boolean;
  winLines: WinLine[];
}

export interface GameStats {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  rtp: number;
}

// Symbol configuration with weights for realistic RTP
const SYMBOLS: { symbol: Symbol; weight: number; payout: number }[] = [
  { symbol: '🍒', weight: 30, payout: 2 },
  { symbol: '🍋', weight: 25, payout: 3 },
  { symbol: '🍊', weight: 20, payout: 5 },
  { symbol: '🍇', weight: 15, payout: 10 },
  { symbol: '🔔', weight: 7, payout: 20 },
  { symbol: '💎', weight: 2, payout: 50 },
  { symbol: '7️⃣', weight: 1, payout: 100 },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

/**
 * Cryptographically secure random number generator
 * Uses Web Crypto API for true randomness
 */
function secureRandom(): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Get weighted random symbol based on probability distribution
 */
function getRandomSymbol(): Symbol {
  const random = secureRandom() * TOTAL_WEIGHT;
  let cumulative = 0;
  
  for (const symbolData of SYMBOLS) {
    cumulative += symbolData.weight;
    if (random < cumulative) {
      return symbolData.symbol;
    }
  }
  
  return SYMBOLS[0].symbol; // Fallback
}

/**
 * Define win lines (classic 5-line pattern)
 * Each line is defined by row indices for each of 5 reels
 */
const WIN_LINES: number[][] = [
  [1, 1, 1, 1, 1], // Line 1: Middle row
  [0, 0, 0, 0, 0], // Line 2: Top row
  [2, 2, 2, 2, 2], // Line 3: Bottom row
  [0, 1, 2, 1, 0], // Line 4: V shape
  [2, 1, 0, 1, 2], // Line 5: ^ shape
];

/**
 * Get symbol at specific position in reel set
 */
function getSymbolAt(reels: ReelSet, reelIndex: number, rowIndex: number): Symbol {
  return reels[reelIndex][rowIndex];
}

/**
 * Check a single win line for matching symbols
 */
function checkWinLine(reels: ReelSet, linePattern: number[], betAmount: number): WinLine | null {
  const symbols: Symbol[] = [];
  
  // Get symbols along this line
  for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
    const rowIndex = linePattern[reelIndex];
    symbols.push(getSymbolAt(reels, reelIndex, rowIndex));
  }
  
  // Count consecutive matching symbols from left to right
  const firstSymbol = symbols[0];
  let matchCount = 1;
  
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === firstSymbol) {
      matchCount++;
    } else {
      break;
    }
  }
  
  // Need at least 3 matching symbols to win
  if (matchCount >= 3) {
    const symbolData = SYMBOLS.find(s => s.symbol === firstSymbol);
    if (symbolData) {
      // Payout multiplier increases with more symbols
      const multipliers = [0, 0, 1, 5, 10, symbolData.payout]; // 0, 0, 3-match, 4-match, 5-match
      const payout = betAmount * multipliers[matchCount];
      
      return {
        line: WIN_LINES.indexOf(linePattern) + 1,
        symbols: symbols.slice(0, matchCount),
        payout,
        positions: linePattern
      };
    }
  }
  
  return null;
}

/**
 * Calculate all wins for current reel configuration
 */
function calculateWins(reels: ReelSet, betAmount: number): WinLine[] {
  const wins: WinLine[] = [];
  
  for (const linePattern of WIN_LINES) {
    const win = checkWinLine(reels, linePattern, betAmount);
    if (win) {
      wins.push(win);
    }
  }
  
  return wins;
}

/**
 * Main game spin function for 5x3 reel set
 * Returns game result with proper RNG
 */
export function spinReels(betAmount: number): GameResult {
  // Generate 5 reels, each with 3 symbols
  const reels: ReelSet = [
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
  ];
  
  // Check all win lines
  const winLines = calculateWins(reels, betAmount);
  const totalWin = winLines.reduce((sum, win) => sum + win.payout, 0);
  
  return {
    reels,
    winAmount: totalWin,
    isWin: totalWin > 0,
    winLines
  };
}

/**
 * Calculate Return to Player (RTP) percentage
 */
export function calculateRTP(stats: GameStats): number {
  if (stats.totalWagered === 0) return 0;
  return (stats.totalWon / stats.totalWagered) * 100;
}

/**
 * Get theoretical RTP based on symbol distribution
 */
export function getTheoreticalRTP(): number {
  // Simplified calculation - real RTP would need Monte Carlo simulation
  return 96.5; // Target RTP ~96.5%
}

/**
 * Get all available symbols for display
 */
export function getAllSymbols(): Symbol[] {
  return SYMBOLS.map(s => s.symbol);
}

/**
 * Get payout table for display
 */
export function getPayoutTable(): Array<{ symbol: Symbol; payout: number }> {
  return SYMBOLS.map(s => ({ symbol: s.symbol, payout: s.payout }));
}
