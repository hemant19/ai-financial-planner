import { AssetClass, AssetCategory, Holding } from '@core/types';

export interface ClassificationResult {
  assetClass: AssetClass;
  assetCategory: AssetCategory;
}

/**
 * Heuristic engine to classify holdings based on symbol, name, and market cap.
 */
export function classifyHolding(
  holding: Holding, 
  marketCap?: number, // In the currency of the holding
  usdToInr: number = 90
): ClassificationResult {
  const name = holding.name.toUpperCase();
  const symbol = holding.symbol.toUpperCase();

  // 1. SGB and Gold handling
  if (symbol.startsWith('SGB') || name.includes('GOLD') || symbol === 'GOLDBEES') {
    return { assetClass: 'COMMODITY', assetCategory: 'GOLD' };
  }
  if (name.includes('SILVER') || symbol === 'SILVERBEES') {
    return { assetClass: 'COMMODITY', assetCategory: 'SILVER' };
  }

  // 2. Mutual Fund logic (based on name keywords)
  if (name.includes('LIQUID')) {
    return { assetClass: 'DEBT', assetCategory: 'LIQUID_FUND' };
  }
  if (name.includes('ARBITRAGE')) {
    return { assetClass: 'DEBT', assetCategory: 'ARBITRAGE_FUND' };
  }
  if (name.includes('BOND') || name.includes('DEBT') || name.includes('SHORT TERM')) {
    return { assetClass: 'DEBT', assetCategory: 'DEBT_FUND' };
  }
  if (name.includes('NIFTY 50') || name.includes('INDEX') || name.includes('SENSEX')) {
    return { assetClass: 'EQUITY', assetCategory: 'INDEX_FUND' };
  }
  if (name.includes('SMALL CAP')) {
    return { assetClass: 'EQUITY', assetCategory: 'SMALLCAP' };
  }
  if (name.includes('MID CAP')) {
    return { assetClass: 'EQUITY', assetCategory: 'MIDCAP' };
  }
  if (name.includes('LARGE') || name.includes('BLUECHIP') || name.includes('NIFTY NEXT 50')) {
    return { assetClass: 'EQUITY', assetCategory: 'LARGECAP' };
  }

  // 3. Stock Classification by Market Cap (indicative thresholds)
  if (marketCap) {
    let capInInr = marketCap;
    if (holding.currency === 'USD') {
        capInInr = marketCap * usdToInr;
    }

    // India Thresholds (Cr): Large > 20k, Mid 5k-20k, Small < 5k
    // Yahoo marketCap is in units, so 20,000 Cr = 200,000,000,000 (200B)
    const CR = 10000000;
    if (capInInr > 20000 * CR) {
        return { assetClass: 'EQUITY', assetCategory: 'LARGECAP' };
    } else if (capInInr > 5000 * CR) {
        return { assetClass: 'EQUITY', assetCategory: 'MIDCAP' };
    } else {
        return { assetClass: 'EQUITY', assetCategory: 'SMALLCAP' };
    }
  }

  // 4. Default fallbacks based on existing (old) assetClass
  // If we already knew it was an equity but cap is missing
  if ((holding as any).assetClass === 'EQUITY' || (holding as any).assetClass === 'US_EQUITY') {
      return { assetClass: 'EQUITY', assetCategory: 'MULTICAP' };
  }

  return { assetClass: 'OTHER', assetCategory: 'OTHER' };
}
