import type { SampleData, Holding } from '../types';
import baseData from './financial-data.json';
import marketDataRaw from './market-data.json';

const marketData = marketDataRaw as Record<string, any>;

const mergedHoldings = (baseData.holdings as Holding[]).map(h => {
    const key = h.symbol || h.isin || h.id;
    const marketInfo = marketData[key];
    if (marketInfo) {
        return { ...h, ...marketInfo };
    }
    return h;
});

export const sampleData: SampleData = {
    ...baseData,
    holdings: mergedHoldings
} as SampleData;