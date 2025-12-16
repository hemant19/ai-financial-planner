import { sampleData } from '../data/sample-data';
import { Account, FixedDeposit, Holding, RealEstate, Member } from '../types';

export class DataService {
  private static readonly USD_TO_INR = 83;

  static getMembers(): Member[] {
    return sampleData.members;
  }

  static getMember(id: string): Member | undefined {
    return sampleData.members.find((m) => m.id === id);
  }

  private static getAccounts(memberId: string | null): Account[] {
    if (!memberId) return sampleData.accounts;
    return sampleData.accounts.filter((a) => a.memberId === memberId);
  }

  static getHoldings(memberId: string | null, assetClass?: string): Holding[] {
    const accountIds = this.getAccounts(memberId).map((a) => a.id);
    return sampleData.holdings.filter(
      (h) =>
        accountIds.includes(h.accountId) &&
        (!assetClass || h.assetClass === assetClass)
    );
  }

  static getFixedDeposits(memberId: string | null): FixedDeposit[] {
    const accountIds = this.getAccounts(memberId).map((a) => a.id);
    return sampleData.fixedDeposits.filter((fd) => accountIds.includes(fd.accountId));
  }

  static getRealEstate(memberId: string | null): RealEstate[] {
    if (!memberId) return sampleData.realEstate;
    return sampleData.realEstate.filter((re) => re.ownerMemberIds.includes(memberId));
  }

  static calculateTotalAssets(memberId: string | null): number {
    const holdingsValue = this.getHoldings(memberId).reduce((acc, h) => {
      const value = h.quantity * (h.lastPrice || 0);
      return acc + (h.currency === 'USD' ? value * this.USD_TO_INR : value);
    }, 0);

    const fdValue = this.getFixedDeposits(memberId).reduce(
      (acc, fd) => acc + fd.principalAmount,
      0
    );

    const reValue = this.getRealEstate(memberId).reduce(
      (acc, re) => acc + re.currentValue,
      0
    );

    return holdingsValue + fdValue + reValue;
  }

  static calculateLiabilities(memberId: string | null): number {
    return 0; // Placeholder
  }

  static calculateNetWorth(memberId: string | null): number {
    return this.calculateTotalAssets(memberId) - this.calculateLiabilities(memberId);
  }
}
