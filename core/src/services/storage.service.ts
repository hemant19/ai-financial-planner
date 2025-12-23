import fs from 'fs-extra';
import path from 'path';
import type { SampleData, Holding } from '../types';

// Paths are relative to the project root when running from CLI
const BASE_DATA_PATH = path.resolve('core/src/data/financial-data.json');
const MARKET_DATA_PATH = path.resolve('core/src/data/market-data.json');

interface MarketDataEntry {
  lastPrice?: number;
  dayChange?: number;
  dayChangePercent?: number;
  lastUpdated?: string;
  assetClass?: any;
  assetCategory?: any;
  assetType?: any;
  analysis?: any;
}

interface MarketDataStore {
  [symbol: string]: MarketDataEntry;
}

export class StorageService {
  
  static async loadData(): Promise<SampleData> {
    if (!await fs.pathExists(BASE_DATA_PATH)) {
      throw new Error(`Base data file not found at ${BASE_DATA_PATH}`);
    }

    const baseData: SampleData = await fs.readJson(BASE_DATA_PATH);
    
    let marketData: MarketDataStore = {};
    if (await fs.pathExists(MARKET_DATA_PATH)) {
      marketData = await fs.readJson(MARKET_DATA_PATH);
    }

    // Merge Market Data into Holdings
    baseData.holdings = baseData.holdings.map(h => {
      // Try symbol, then ISIN, then ID
      const key = h.symbol || h.isin || h.id; 
      const marketInfo = marketData[key];
      
      if (marketInfo) {
        return { ...h, ...marketInfo } as Holding;
      }
      return h;
    });

    return baseData;
  }

  static async saveData(data: SampleData): Promise<void> {
    const baseData = { ...data };
    const marketData: MarketDataStore = {};

    // Split Holdings
    baseData.holdings = data.holdings.map(h => {
      // Extract Market Data
      const key = h.symbol || h.isin || h.id;
      
      marketData[key] = {
        lastPrice: h.lastPrice,
        dayChange: h.dayChange,
        dayChangePercent: h.dayChangePercent,
        lastUpdated: h.lastUpdated,
        assetClass: h.assetClass,
        assetCategory: h.assetCategory,
        assetType: h.assetType,
        analysis: h.analysis
      };

      // Return Clean Holding (Static Data only)
      const { 
          lastPrice, dayChange, dayChangePercent, lastUpdated, analysis, 
          assetCategory, assetType, 
          ...staticHolding 
      } = h;
      
      return staticHolding as Holding;
    });

    await fs.writeJson(BASE_DATA_PATH, baseData, { spaces: 2 });
    await fs.writeJson(MARKET_DATA_PATH, marketData, { spaces: 2 });
    
    console.log(`Data saved: Base (${BASE_DATA_PATH}) | Market (${MARKET_DATA_PATH})`);
  }
}
