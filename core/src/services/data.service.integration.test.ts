import { describe, it, expect } from 'vitest';
import { FixedDataService } from './data.service';
import fs from 'fs-extra';
import path from 'path';
import { SampleData } from '../types';

describe('DataService Integration with Real Data', () => {
  it('should fetch mutual funds from the original financial-data.json', async () => {
    // 1. Load the original JSON file
    const jsonPath = path.resolve('core/src/data/financial-data.json');
    const originalData: SampleData = await fs.readJson(jsonPath);

    // 2. Instantiate service with real data
    const service = new FixedDataService(originalData);

    // 3. Fetch Mutual Funds
    // In our system, MFs have assetType: 'MUTUAL_FUND'
    const mutualFunds = await service.getHoldingsForMember(null, undefined, 'MUTUAL_FUND');

    console.log(`Found ${mutualFunds.length} Mutual Funds in original data.`);
    
    // 4. Basic Assertions
    expect(Array.isArray(mutualFunds)).toBe(true);
    
    if (mutualFunds.length > 0) {
        expect(mutualFunds[0].assetType).toBe('MUTUAL_FUND');
        // Log the first few for verification
        mutualFunds.slice(0, 3).forEach(mf => {
            console.log(`- ${mf.name} (${mf.symbol || mf.isin})`);
        });
    } else {
        console.warn('No Mutual Funds found in the current financial-data.json. Verification limited.');
    }
  });
});
