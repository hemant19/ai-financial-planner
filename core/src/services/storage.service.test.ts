import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import { StorageService } from './storage.service';

vi.mock('fs-extra');

describe('StorageService', () => {
  const mockBaseData = {
    holdings: [
      { id: 'h1', symbol: 'RELIANCE', name: 'Reliance', quantity: 10, averagePrice: 2000, currency: 'INR' }
    ]
  };

  const mockMarketData = {
    'RELIANCE': {
      lastPrice: 2500,
      dayChange: 50,
      dayChangePercent: 2
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and merge base data with market data', async () => {
    vi.mocked(fs.pathExists as any).mockResolvedValue(true);
    vi.mocked(fs.readJson).mockImplementation(async (path) => {
      if (path.toString().includes('financial-data.json')) return mockBaseData;
      if (path.toString().includes('market-data.json')) return mockMarketData;
      return {};
    });

    const data = await StorageService.loadData();

    expect(data.holdings[0].lastPrice).toBe(2500);
    expect(data.holdings[0].dayChange).toBe(50);
    expect(data.holdings[0].name).toBe('Reliance');
  });

  it('should throw error if base data file missing', async () => {
    vi.mocked(fs.pathExists as any).mockResolvedValue(false);

    await expect(StorageService.loadData()).rejects.toThrow('Base data file not found');
  });

  it('should split data correctly when saving', async () => {
    const dataToSave: any = {
      holdings: [
        { 
            id: 'h1', symbol: 'RELIANCE', name: 'Reliance', quantity: 10, averagePrice: 2000, currency: 'INR',
            lastPrice: 2600, dayChange: 100 // Market data
        }
      ]
    };

    await StorageService.saveData(dataToSave);

    // Verify first writeJson call (Base Data)
    const baseDataSaved = vi.mocked(fs.writeJson).mock.calls[0][1];
    expect(baseDataSaved.holdings[0].lastPrice).toBeUndefined();
    expect(baseDataSaved.holdings[0].symbol).toBe('RELIANCE');

    // Verify second writeJson call (Market Data)
    const marketDataSaved = vi.mocked(fs.writeJson).mock.calls[1][1];
    expect(marketDataSaved['RELIANCE'].lastPrice).toBe(2600);
  });
});
