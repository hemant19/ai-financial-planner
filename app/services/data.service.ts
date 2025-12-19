import { sampleData } from '../data/financial-data';
import { Account, FixedDeposit, Holding, RealEstate, Member, Family, UserProfile, Invitation, AssetClass, IDataService, AssetAggregates } from '../types';

export class FixedDataService implements IDataService {
  private readonly USD_TO_INR = 83;

  // --- Read Methods ---

  async getMembers(): Promise<Member[]> {
    return sampleData.members;
  }

  async getMember(id: string): Promise<Member | undefined> {
    return sampleData.members.find((m) => m.id === id);
  }

  async getFamilyMembers(familyId: string): Promise<Member[]> {
    return sampleData.members.filter(m => m.familyId === familyId);
  }

  async getAccounts(memberIds: string[]): Promise<Account[]> {
    if (memberIds.length === 0) return [];
    return sampleData.accounts.filter(a => memberIds.includes(a.memberId));
  }

  async getAccount(accountId: string): Promise<Account | null> {
    return sampleData.accounts.find(a => a.id === accountId) || null;
  }

  async getFixedDeposits(accountId: string): Promise<FixedDeposit[]> {
    return sampleData.fixedDeposits.filter(fd => fd.accountId === accountId);
  }

  async getHoldings(accountId: string): Promise<Holding[]> {
    return sampleData.holdings.filter(h => h.accountId === accountId);
  }

  async getHoldingsForMember(memberId: string | null, assetClass?: AssetClass): Promise<Holding[]> {
    let accounts: Account[] = [];
    if (!memberId) {
      accounts = sampleData.accounts;
    } else {
      accounts = sampleData.accounts.filter(a => a.memberId === memberId);
    }
    const accountIds = accounts.map(a => a.id);
    let holdings = sampleData.holdings.filter(h => accountIds.includes(h.accountId));
    if (assetClass) {
      holdings = holdings.filter(h => h.assetClass === assetClass);
    }
    return holdings;
  }

  async getFixedDepositsForMember(memberId: string | null): Promise<FixedDeposit[]> {
    let accounts: Account[] = [];
    if (!memberId) {
      accounts = sampleData.accounts;
    } else {
      accounts = sampleData.accounts.filter(a => a.memberId === memberId);
    }
    const accountIds = accounts.map(a => a.id);
    return sampleData.fixedDeposits.filter(fd => accountIds.includes(fd.accountId));
  }

  async getRealEstate(memberId: string | null): Promise<RealEstate[]> {
    if (!memberId) return sampleData.realEstate;
    return sampleData.realEstate.filter((re) => re.ownerMemberIds.includes(memberId));
  }

  // --- Calculation Methods ---

  async getAssetAggregates(memberId: string | null): Promise<AssetAggregates> {
    let accounts: Account[] = [];
    if (!memberId) {
      accounts = sampleData.accounts;
    } else {
      accounts = sampleData.accounts.filter(a => a.memberId === memberId);
    }
    const accountIds = accounts.map(a => a.id);

    const holdings = sampleData.holdings.filter(h => accountIds.includes(h.accountId));
    const fixedDeposits = sampleData.fixedDeposits.filter(fd => accountIds.includes(fd.accountId));
    const realEstate = await this.getRealEstate(memberId);

    const bankBalance = accounts
      .filter(a => a.type === 'BANK')
      .reduce((acc, a) => acc + (a.currentBalance || 0), 0);

    const indianEquities = holdings
      .filter(h => h.assetClass === 'EQUITY' && h.currency === 'INR')
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0)), 0);

    const usStocks = holdings
      .filter(h => h.assetClass === 'US_EQUITY' || (h.assetClass === 'EQUITY' && h.currency === 'USD'))
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0) * this.USD_TO_INR), 0);

    const mutualFunds = holdings
      .filter(h => h.assetClass === 'MUTUAL_FUND')
      .reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0)), 0);

    const fdValue = fixedDeposits.reduce((acc, fd) => acc + fd.principalAmount, 0);

    const reValue = realEstate.reduce((acc, re) => acc + re.currentValue, 0);

    return {
      bankBalance,
      fixedDeposits: fdValue,
      indianEquities,
      usStocks,
      mutualFunds,
      realEstate: reValue,
      total: bankBalance + fdValue + indianEquities + usStocks + mutualFunds + reValue
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
}

export const DataService = new FixedDataService();
