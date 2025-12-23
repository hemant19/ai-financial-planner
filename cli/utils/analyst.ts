import { HoldingAnalysis } from '@core/types';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number | undefined {
  if (data.length < period) return undefined;
  const slice = data.slice(data.length - period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculates Relative Strength Index (RSI)
 * Standard 14-period RSI
 */
export function calculateRSI(prices: number[], period: number = 14): number | undefined {
  if (prices.length < period + 1) return undefined;

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smooth the following values
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = ((avgGain * (period - 1)) + currentGain) / period;
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export interface FinancialData {
  roe?: number;            // Return on Equity
  debtToEquity?: number;   // Debt to Equity Ratio
  peRatio?: number;        // Price to Earnings
  revenueGrowth?: number;  // Revenue Growth
  currentPrice: number;
  fiftyTwoWeekHigh?: number;
}

/**
 * The Brain: Analyzes stock data to generate scores and a verdict.
 */
export function analyzeStock(
  prices: number[], // Historical closing prices (oldest to newest)
  financials: FinancialData
): HoldingAnalysis {
  const currentPrice = financials.currentPrice;
  const metrics: HoldingAnalysis['metrics'] = {
    roe: financials.roe,
    debtToEquity: financials.debtToEquity,
    peRatio: financials.peRatio,
    revenueGrowth: financials.revenueGrowth,
    fiftyTwoWeekHigh: financials.fiftyTwoWeekHigh,
  };

  const signals: string[] = [];
  
  // --- 1. Quality Score Calculation (0-10) ---
  let qualityScore = 0;

  // ROE: > 15% is good (+3), > 10% is okay (+1)
  if ((financials.roe || 0) > 0.15) {
    qualityScore += 3;
    signals.push("High ROE");
  } else if ((financials.roe || 0) > 0.10) {
    qualityScore += 1;
  }

  // Debt to Equity: < 0.5 is safe (+3), < 1.0 is manageable (+1)
  if (financials.debtToEquity !== undefined) {
      if (financials.debtToEquity < 50) { // Yahoo usually gives D/E as %, e.g., 40.5
        qualityScore += 3;
        signals.push("Low Debt");
      } else if (financials.debtToEquity < 100) {
        qualityScore += 1;
      }
  }

  // Revenue Growth: > 10% (+2)
  if ((financials.revenueGrowth || 0) > 0.10) {
      qualityScore += 2;
      signals.push("Growing Revenue");
  }

  // P/E Ratio Check (Bonus/Penalty)
  // Hard to judge without sector, but extreme P/E (>80) is risky
  if ((financials.peRatio || 0) > 80) {
      qualityScore -= 1; 
      signals.push("Expensive Valuation");
  } else if ((financials.peRatio || 0) > 0 && (financials.peRatio || 0) < 25) {
      qualityScore += 2; // Reasonable Valuation
      signals.push("Reasonable Val");
  }

  // Cap Score at 10
  qualityScore = Math.min(Math.max(qualityScore, 0), 10);


  // --- 2. Momentum Score Calculation (0-10) ---
  let momentumScore = 0;
  
  const fiftyDMA = calculateSMA(prices, 50);
  const twoHundredDMA = calculateSMA(prices, 200);
  const rsi = calculateRSI(prices, 14);

  metrics.fiftyDMA = fiftyDMA;
  metrics.twoHundredDMA = twoHundredDMA;
  metrics.rsi = rsi;

  // Trend Alignment
  if (fiftyDMA && twoHundredDMA) {
      if (currentPrice > fiftyDMA) {
          momentumScore += 3;
          signals.push("Price > 50DMA");
      }
      if (fiftyDMA > twoHundredDMA) {
          momentumScore += 2;
          signals.push("Golden Cross Trend");
      }
      // Reversal warning
      if (currentPrice < fiftyDMA && fiftyDMA > twoHundredDMA) {
          momentumScore -= 1;
          signals.push("Short Term Weakness");
      }
  }

  // RSI Check
  if (rsi !== undefined) {
      if (rsi > 50 && rsi < 70) {
          momentumScore += 3; // Sweet spot
          signals.push("Strong Momentum");
      } else if (rsi >= 70) {
          momentumScore += 1; // Overbought but strong
          signals.push("Overbought");
      } else if (rsi < 30) {
          momentumScore -= 1; // Oversold
          signals.push("Oversold");
      }
  }

  // 52-Week High Proximity (within 10%)
  if (financials.fiftyTwoWeekHigh) {
      const distFromHigh = (financials.fiftyTwoWeekHigh - currentPrice) / financials.fiftyTwoWeekHigh;
      if (distFromHigh < 0.10) {
          momentumScore += 2;
          signals.push("Near 52W High");
      }
  }

  momentumScore = Math.min(Math.max(momentumScore, 0), 10);


  // --- 3. Verdict Generation ---
  let verdict: HoldingAnalysis['verdict'] = 'HOLD';

  if (qualityScore >= 7 && momentumScore >= 6) {
      verdict = 'BUY'; // "Compounder"
  } else if (qualityScore >= 7 && momentumScore < 4) {
      verdict = 'ACCUMULATE'; // "Value Pick"
  } else if (qualityScore < 4 && momentumScore >= 7) {
      verdict = 'TRIM'; // "Rocket Ship / Trailing Stop" - High risk momentum
  } else if (qualityScore < 4 && momentumScore < 4) {
      verdict = 'SELL'; // "Trap"
  } else if (qualityScore >= 5 && momentumScore >= 5) {
      verdict = 'HOLD'; // Average
  }

  // Special Case: Extreme Valuation with falling momentum
  if (financials.peRatio && financials.peRatio > 100 && momentumScore < 5) {
      verdict = 'TRIM';
  }

  return {
    scores: {
        quality: qualityScore,
        momentum: momentumScore,
        total: (qualityScore + momentumScore) / 2
    },
    verdict,
    signals,
    metrics
  };
}
