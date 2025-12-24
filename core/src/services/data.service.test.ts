import { describe, it, expect, beforeEach } from 'vitest';
import { FixedDataService } from './data.service';
import { SampleData } from '../types';

const mockData: SampleData = {
  family: {
    id: 'fam_1',
    name: 'Test Family',
    baseCurrency: 'INR',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  members: [
    { id: 'mem_1', displayName: 'Member A', role: 'OWNER', relationship: 'Self' },
    { id: 'mem_2', displayName: 'Member B', role: 'VIEWER', relationship: 'Spouse' }
  ],
  accounts: [
    { id: 'acc_1', memberId: 'mem_1', type: 'BANK', currency: 'INR', currentBalance: 10000, institutionName: 'Bank A', accountName: 'Savings', isActive: true },
    { id: 'acc_2', memberId: 'mem_1', type: 'DEMAT', currency: 'INR', institutionName: 'Broker A', accountName: 'Demat', isActive: true },
    { id: 'acc_3', memberId: 'mem_2', type: 'US_BROKER', currency: 'USD', institutionName: 'Broker US', accountName: 'US Stocks', isActive: true }
  ],
  fixedDeposits: [
    { id: 'fd_1', accountId: 'acc_1', principalAmount: 50000, interestRate: 6, bankName: 'Bank A', fdNumber: 'FD123', startDate: '2023-01-01', maturityDate: '2024-01-01', status: 'ACTIVE' }
  ],
  holdings: [
    // Member 1 - Indian Equity
    { 
      id: 'h_1', accountId: 'acc_2', assetClass: 'EQUITY', assetType: 'DIRECT', symbol: 'TATA', name: 'Tata Motors', 
      quantity: 10, averagePrice: 500, lastPrice: 600, currency: 'INR', dayChange: 10 // +10 INR per share
    },
    // Member 1 - Mutual Fund
    { 
      id: 'h_2', accountId: 'acc_2', assetClass: 'MUTUAL_FUND', assetType: 'MUTUAL_FUND', symbol: 'HDFCMF', name: 'HDFC Top 100', 
      quantity: 100, averagePrice: 50, lastPrice: 60, currency: 'INR', dayChange: -0.5 // -0.5 INR per unit
    },
    // Member 2 - US Stock
    { 
      id: 'h_3', accountId: 'acc_3', assetClass: 'EQUITY', assetType: 'DIRECT', symbol: 'AAPL', name: 'Apple', 
      quantity: 5, averagePrice: 150, lastPrice: 200, currency: 'USD', dayChange: 2 // +2 USD per share
    }
  ],
  realEstate: [
    { 
      id: 're_1', ownerMemberIds: ['mem_1'], name: 'Apartment', location: 'Mumbai', 
      purchaseDate: '2020-01-01', purchasePrice: 5000000, currentValue: 6000000, currency: 'INR', lastValuationDate: '2023-01-01', isSold: false 
    }
  ],
  trades: []
};

describe('FixedDataService', () => {
  let service: FixedDataService;

  beforeEach(() => {
    service = new FixedDataService(mockData);
  });

  it('should return all members', async () => {
    const members = await service.getMembers();
    expect(members).toHaveLength(2);
    expect(members[0].displayName).toBe('Member A');
  });

  it('should return accounts for specific member', async () => {
    const accounts = await service.getAccounts(['mem_1']);
    expect(accounts).toHaveLength(2);
    expect(accounts.map(a => a.id)).toContain('acc_1');
    expect(accounts.map(a => a.id)).toContain('acc_2');
  });

  it('should return fixed deposits for member', async () => {
    const fds = await service.getFixedDepositsForMember('mem_1');
    expect(fds).toHaveLength(1);
    expect(fds[0].principalAmount).toBe(50000);
  });

  it('should calculate asset aggregates correctly for Member 1', async () => {
    // Member 1 has:
    // Bank Balance: 10,000
    // FD: 50,000
    // Indian Equity: 10 * 600 = 6,000
    // Mutual Funds: 100 * 60 = 6,000
    // Real Estate: 6,000,000
    // Total: 6,072,000
    
    const aggregates = await service.getAssetAggregates('mem_1');
    
    expect(aggregates.bankBalance).toBe(10000);
    expect(aggregates.fixedDeposits).toBe(50000);
    expect(aggregates.indianEquities).toBe(6000);
    expect(aggregates.mutualFunds).toBe(6000);
    expect(aggregates.realEstate).toBe(6000000);
    expect(aggregates.usStocks).toBe(0); // Member 1 has no US stocks
    expect(aggregates.total).toBe(6072000);
  });

  it('should calculate asset aggregates correctly for Member 2 (US Stocks)', async () => {
    // Member 2 has:
    // US Stocks: 5 * 200 = 1000 USD
    // Conversion Rate in Service is 90
    // Total INR: 1000 * 90 = 90,000
    
    const aggregates = await service.getAssetAggregates('mem_2');
    
    expect(aggregates.usStocks).toBe(90000);
    expect(aggregates.total).toBe(90000);
  });

  it('should calculate net worth for the whole family', async () => {
    // Total Family Assets:
    // Mem 1 (6,072,000) + Mem 2 (90,000) = 6,162,000
    
    const netWorth = await service.calculateNetWorth(null); // null for all members
    expect(netWorth).toBe(6162000);
  });

  it('should filter holdings by asset class', async () => {
    const holdings = await service.getHoldingsForMember(null, 'EQUITY');
    expect(holdings).toHaveLength(2); // TATA and AAPL
    expect(holdings.map(h => h.symbol)).toEqual(expect.arrayContaining(['TATA', 'AAPL']));
  });

  it('should calculate daily change correctly', async () => {
    // Member 1: 
    // TATA: 10 qty * 10 dayChange = +100 INR
    // HDFC: 100 qty * -0.5 dayChange = -50 INR
    // Total: +50 INR
    const change1 = await service.calculateDailyChange('mem_1');
    expect(change1).toBe(50);

    // Member 2:
    // AAPL: 5 qty * 2 dayChange = 10 USD
    // 10 USD * 90 (USD_TO_INR) = 900 INR
    const change2 = await service.calculateDailyChange('mem_2');
    expect(change2).toBe(900);
  });

  it('should return category aggregates sorted by value', async () => {
    // All members:
    // TATA: 6000 (EQUITY -> default OTHER if not specified)
    // HDFC: 6000 (MUTUAL_FUND -> default OTHER if not specified)
    // AAPL: 90000 (EQUITY -> default OTHER if not specified)
    
    // Let's add assetCategory to mock data to make it interesting
    const aggregates = await service.getCategoryAggregates(null);
    expect(aggregates).toHaveLength(1);
    expect(aggregates[0].label).toBe('OTHER');
    expect(aggregates[0].value).toBe(6000 + 6000 + 90000);
  });

  it('should generate a portfolio context string', async () => {
    const context = await service.getPortfolioContext('mem_1');
    expect(context).toContain('FINANCIAL PROFILE SUMMARY');
    expect(context).toContain('Net Worth: ₹6,072,000');
    expect(context).toContain('Tata Motors');
  });
});
