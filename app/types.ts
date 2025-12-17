export interface Family {
  id: string;
  name: string;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  familyId?: string;
  displayName: string;
  relationship: string;
  email?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export type AccountType = 'BANK' | 'DEMAT' | 'US_BROKER';
export type Currency = 'INR' | 'USD' | 'EUR' | string;

export interface Account {
  id: string;
  memberId: string;
  type: AccountType;
  institutionName: string;
  accountName: string;
  accountNumberLast4?: string;
  currency: Currency;
  currentBalance?: number;
  linkedPlatformId?: string;
  isActive: boolean;
}

export interface FixedDeposit {
  id: string;
  accountId: string;
  bankName: string;
  fdNumber: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  maturityAmount?: number;
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
}

export type AssetClass = 'EQUITY' | 'MUTUAL_FUND' | 'ETF' | 'BOND' | 'REIT' | 'US_EQUITY';

export interface Holding {
  id: string;
  accountId: string;
  assetClass: AssetClass;
  symbol: string;
  isin?: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currency: Currency;
  lastPrice?: number;
  lastUpdated?: string;
}

export interface RealEstate {
  id: string;
  ownerMemberIds: string[];
  name: string;
  location: string;
  address?: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: Currency;
  currentValue: number;
  lastValuationDate: string;
  isSold: boolean;
}

export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  isin?: string;
  tradeDate: string;
  type: TradeType;
  quantity: number;
  price: number;
  currency: Currency;
  fees?: number;
  netAmount: number;
  exchange?: string;
}

export interface SampleData {
  family: Family;
  members: Member[];
  accounts: Account[];
  fixedDeposits: FixedDeposit[];
  holdings: Holding[];
  realEstate: RealEstate[];
  trades: Trade[];
}

export interface TempMember extends Member {
  isPrimary?: boolean;
}

export interface TempAccount extends Account {
  tempHoldings?: Holding[];
  tempFixedDeposits?: FixedDeposit[];
}
