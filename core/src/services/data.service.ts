import { sampleData } from '../data/financial-data';
import { Account, FixedDeposit, Holding, RealEstate, Member, Family, UserProfile, Invitation, AssetClass, DataService as DataServiceInterface, AssetAggregates, SampleData } from '../types';

export class FixedDataService implements DataServiceInterface {
  private readonly USD_TO_INR = 90;

  constructor(private data: SampleData) {}

  // --- Read Methods ---

  async getMembers(): Promise<Member[]> {
    return this.data.members;
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.data.members.find((m) => m.id === id);
  }

  async getFamilyMembers(familyId: string): Promise<Member[]> {
    return this.data.members.filter(m => m.familyId === familyId);
  }

  async getAccounts(memberIds: string[]): Promise<Account[]> {
    if (memberIds.length === 0) return [];
    return this.data.accounts.filter(a => memberIds.includes(a.memberId));
  }

  async getAccount(accountId: string): Promise<Account | null> {
    return this.data.accounts.find(a => a.id === accountId) || null;
  }

  async getFixedDeposits(accountId: string): Promise<FixedDeposit[]> {
    return this.data.fixedDeposits.filter(fd => fd.accountId === accountId);
  }

  async getHoldings(accountId: string): Promise<Holding[]> {
    return this.data.holdings.filter(h => h.accountId === accountId);
  }

  async getHolding(id: string): Promise<Holding | undefined> {
    return this.data.holdings.find(h => h.id === id);
  }

  async getHoldingsForMember(
    memberId: string | null, 
    assetClass?: AssetClass,
    assetType?: 'DIRECT' | 'MUTUAL_FUND' | 'ETF' | 'SGB'
  ): Promise<Holding[]> {
    let accounts: Account[] = [];
    if (!memberId) {
      accounts = this.data.accounts;
    } else {
      accounts = this.data.accounts.filter(a => a.memberId === memberId);
    }
    const accountIds = accounts.map(a => a.id);
    let holdings = this.data.holdings.filter(h => accountIds.includes(h.accountId));
    
    if (assetClass !== undefined) {
      holdings = holdings.filter(h => h.assetClass === assetClass);
    }
    if (assetType !== undefined) {
      holdings = holdings.filter(h => h.assetType === assetType);
    }
    return holdings;
  }

  async getFixedDepositsForMember(memberId: string | null): Promise<FixedDeposit[]> {
    let accounts: Account[] = [];
    if (!memberId) {
      accounts = this.data.accounts;
    } else {
      accounts = this.data.accounts.filter(a => a.memberId === memberId);
    }
    const accountIds = accounts.map(a => a.id);
    return this.data.fixedDeposits.filter(fd => accountIds.includes(fd.accountId));
  }

  async getRealEstate(memberId: string | null): Promise<RealEstate[]> {
    if (!memberId) return this.data.realEstate;
    return this.data.realEstate.filter((re) => re.ownerMemberIds.includes(memberId));
  }

  // --- Calculation Methods ---

  async getAssetAggregates(memberId: string | null): Promise<AssetAggregates> {
    let accounts: Account[] = [];
    if (!memberId) {
      accounts = this.data.accounts;
    } else {
      accounts = this.data.accounts.filter(a => a.memberId === memberId);
    }
    const accountIds = accounts.map(a => a.id);

    const holdings = this.data.holdings.filter(h => accountIds.includes(h.accountId));
    const fixedDeposits = this.data.fixedDeposits.filter(fd => accountIds.includes(fd.accountId));
    const realEstate = await this.getRealEstate(memberId);

    const bankBalance = accounts
      .filter(a => a.type === 'BANK')
      .reduce((acc, a) => acc + (a.currentBalance || 0), 0);

    const indianEquities = holdings
      .filter(h => h.assetClass === 'EQUITY' && h.currency === 'INR' && h.assetType === 'DIRECT')
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0)), 0);

    const usStocks = holdings
      .filter(h => h.assetClass === 'EQUITY' && h.currency === 'USD' && h.assetType === 'DIRECT')
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0) * this.USD_TO_INR), 0);

    const mutualFunds = holdings
      .filter(h => h.assetType === 'MUTUAL_FUND')
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0)), 0);

    const commodities = holdings
      .filter(h => h.assetClass === 'COMMODITY')
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0)), 0);

    const fdValue = fixedDeposits.reduce((acc, fd) => acc + fd.principalAmount, 0);

    const reValue = realEstate.reduce((acc, re) => acc + re.currentValue, 0);

    return {
      bankBalance,
      fixedDeposits: fdValue,
      indianEquities,
      usStocks,
      mutualFunds,
      commodities,
      realEstate: reValue,
      total: bankBalance + fdValue + indianEquities + usStocks + mutualFunds + commodities + reValue
    };
  }

  async calculateTotalAssets(memberId: string | null): Promise<number> {
    const aggregates = await this.getAssetAggregates(memberId);
    return aggregates.total;
  }

  async calculateLiabilities(memberId: string | null): Promise<number> {
    return 0; // Placeholder
  }

  async calculateNetWorth(memberId: string | null): Promise<number> {
    const totalAssets = await this.calculateTotalAssets(memberId);
    const liabilities = await this.calculateLiabilities(memberId);
    return totalAssets - liabilities;
  }

  async calculateDailyChange(memberId: string | null): Promise<number> {
    const holdings = await this.getHoldingsForMember(memberId);
    return holdings.reduce((acc, h) => {
        const change = (h.quantity * (h.dayChange || 0));
        if (h.currency === 'USD') {
            return acc + (change * this.USD_TO_INR);
        }
        return acc + change;
    }, 0);
  }

  async getCategoryAggregates(memberId: string | null): Promise<{ label: string, value: number }[]> {
    const holdings = await this.getHoldingsForMember(memberId);
    const map = new Map<string, number>();

    holdings.forEach(h => {
        const cat = h.assetCategory || 'OTHER';
        const val = h.quantity * (h.lastPrice || 0) * (h.currency === 'USD' ? this.USD_TO_INR : 1);
        map.set(cat, (map.get(cat) || 0) + val);
    });

    return Array.from(map.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
  }

  async getPortfolioContext(memberId: string | null): Promise<string> {
    const aggregates = await this.getAssetAggregates(memberId);
    const netWorth = await this.calculateNetWorth(memberId);
    const holdings = await this.getHoldingsForMember(memberId);
    
    // Sort holdings by value descending
    const sortedHoldings = holdings.sort((a, b) => {
        const valA = a.quantity * (a.lastPrice || 0) * (a.currency === 'USD' ? this.USD_TO_INR : 1);
        const valB = b.quantity * (b.lastPrice || 0) * (b.currency === 'USD' ? this.USD_TO_INR : 1);
        return valB - valA;
    });

    const topHoldings = sortedHoldings.slice(0, 10).map(h => {
        const val = h.quantity * (h.lastPrice || 0);
        return `- ${h.name} (${h.symbol}): ${h.currency === 'USD' ? '$' : '₹'}${val.toFixed(0)} | Verdict: ${h.analysis?.verdict || 'N/A'} (Q:${h.analysis?.scores.quality || '-'} M:${h.analysis?.scores.momentum || '-'})`;
    }).join('\n');

    const context = `
    FINANCIAL PROFILE SUMMARY
    -------------------------
    Net Worth: ₹${netWorth.toLocaleString()}
    Total Assets: ₹${aggregates.total.toLocaleString()}
    
    ASSET ALLOCATION:
    - Bank Balance: ₹${aggregates.bankBalance.toLocaleString()}
    - Fixed Deposits: ₹${aggregates.fixedDeposits.toLocaleString()}
    - Indian Equities: ₹${aggregates.indianEquities.toLocaleString()}
    - US Stocks: ₹${aggregates.usStocks.toLocaleString()}
    - Mutual Funds: ₹${aggregates.mutualFunds.toLocaleString()}
    - Real Estate: ₹${aggregates.realEstate.toLocaleString()}

    TOP 10 HOLDINGS (by Value):
    ${topHoldings}

    Please use this context to answer my financial questions. Focus on asset allocation balance, quality of holdings based on the verdict, and risk exposure.
    `;
    return context;
  }
}

export const DataService = new FixedDataService(sampleData);