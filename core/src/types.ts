export interface Family {
  id: string;
  name: string;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface Member {
  id: string;
  familyId?: string;
  displayName: string;
  relationship: string;
  email?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  uid?: string; // Linked Auth UID (if registered)
  role: UserRole;
  inviteStatus?: 'NONE' | 'SENT' | 'ACCEPTED';
}

export interface UserProfile {
  uid: string;          // Firebase Auth UID
  email: string;
  memberId: string;     // Link to specific Member record
  familyId: string;     // Quick lookup for context
  createdAt: string;
  lastLoginAt?: string;
}

export interface Invitation {
  id: string;
  email: string;
  familyId: string;
  memberId: string;     // The member profile they will claim
  token: string;
  expiresAt: string;
  status: 'PENDING' | 'USED';
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

export type AssetClass = 'EQUITY' | 'DEBT' | 'COMMODITY' | 'REAL_ESTATE' | 'OTHER' | 'MUTUAL_FUND' | 'US_EQUITY';

export type AssetCategory = 
  | 'LARGECAP' | 'MIDCAP' | 'SMALLCAP' | 'MULTICAP' 
  | 'FD' | 'CASH' | 'LIQUID_FUND' | 'ARBITRAGE_FUND' | 'DEBT_FUND' | 'BOND' 
  | 'GOLD' | 'SILVER' 
  | 'RESIDENTIAL' | 'COMMERCIAL' 
  | 'INDEX_FUND' | 'ETF' | 'SECTOR_FUND' | 'OTHER';

export interface HoldingAnalysis {
  verdict: string;
  scores: {
    quality: number;
    momentum: number;
    total?: number;
  };
  signals: string[];
  metrics: Record<string, any>;
}

export interface Holding {
  id: string;
  accountId: string;
  assetClass: AssetClass;
  assetCategory?: AssetCategory;
  assetType?: 'DIRECT' | 'MUTUAL_FUND' | 'ETF' | 'SGB';
  symbol: string;
  isin?: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currency: Currency;
  lastPrice?: number;
  dayChange?: number;
  dayChangePercent?: number;
  lastUpdated?: string;
  analysis?: HoldingAnalysis;
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

export interface AssetAggregates {
  bankBalance: number;
  fixedDeposits: number;
  indianEquities: number;
  usStocks: number;
  mutualFunds: number;
  commodities: number;
  realEstate: number;
  total: number;
}

export interface DataService {
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  getFamilyMembers(familyId: string): Promise<Member[]>;
  getAccounts(memberIds: string[]): Promise<Account[]>;
  getAccount(accountId: string): Promise<Account | null>;
  getFixedDeposits(accountId: string): Promise<FixedDeposit[]>;
  getHoldings(accountId: string): Promise<Holding[]>;
  getHoldingsForMember(
    memberId: string | null, 
    assetClass?: AssetClass,
    assetType?: 'DIRECT' | 'MUTUAL_FUND' | 'ETF' | 'SGB'
  ): Promise<Holding[]>;
  getFixedDepositsForMember(memberId: string | null): Promise<FixedDeposit[]>;
  getRealEstate(memberId: string | null): Promise<RealEstate[]>;
  getAssetAggregates(memberId: string | null): Promise<AssetAggregates>;
  getCategoryAggregates(memberId: string | null): Promise<{ label: string; value: number }[]>;
  calculateTotalAssets(memberId: string | null): Promise<number>;
  calculateLiabilities(memberId: string | null): Promise<number>;
  calculateNetWorth(memberId: string | null): Promise<number>;
}

export interface TempMember extends Member {
  isPrimary?: boolean;
}

export interface TempAccount extends Account {
  tempHoldings?: Holding[];
  tempFixedDeposits?: FixedDeposit[];
}
