import type { SampleData } from '../types';

export const sampleData: SampleData = {
  family: {
    id: 'f1',
    name: 'Doe Family',
    baseCurrency: 'INR',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  members: [
    {
      id: 'm1',
      familyId: 'f1',
      displayName: 'John Doe',
      relationship: 'Self',
      email: 'john@example.com'
    },
    {
      id: 'm2',
      familyId: 'f1',
      displayName: 'Jane Doe',
      relationship: 'Spouse',
      email: 'jane@example.com'
    },
    {
      id: 'm3',
      familyId: 'f1',
      displayName: 'Junior Doe',
      relationship: 'Child',
      email: 'junior@example.com'
    }
  ],
  accounts: [
    // John's Accounts
    {
      id: 'a1',
      memberId: 'm1',
      type: 'BANK',
      institutionName: 'HDFC Bank',
      accountName: 'John Savings',
      currency: 'INR',
      isActive: true,
      currentBalance: 500000
    },
    {
      id: 'a2',
      memberId: 'm1',
      type: 'DEMAT',
      institutionName: 'Zerodha',
      accountName: 'John Kite',
      currency: 'INR',
      isActive: true
    },
    {
      id: 'a3',
      memberId: 'm1',
      type: 'US_BROKER',
      institutionName: 'Charles Schwab',
      accountName: 'John US Stocks',
      currency: 'USD',
      isActive: true
    },
    // Jane's Accounts
    {
      id: 'a4',
      memberId: 'm2',
      type: 'BANK',
      institutionName: 'ICICI Bank',
      accountName: 'Jane Savings',
      currency: 'INR',
      isActive: true,
      currentBalance: 750000
    },
    {
      id: 'a5',
      memberId: 'm2',
      type: 'DEMAT',
      institutionName: 'Upstox',
      accountName: 'Jane Demat',
      currency: 'INR',
      isActive: true
    },
    {
      id: 'a6',
      memberId: 'm2',
      type: 'US_BROKER',
      institutionName: 'Interactive Brokers',
      accountName: 'Jane IBKR',
      currency: 'USD',
      isActive: true
    },
    // Junior's Accounts (e.g., custodial)
    {
      id: 'a7',
      memberId: 'm3',
      type: 'BANK',
      institutionName: 'HDFC Bank',
      accountName: 'Junior Trust',
      currency: 'INR',
      isActive: true,
      currentBalance: 100000
    }
  ],
  fixedDeposits: [
    // John's FDs
    {
      id: 'fd1',
      accountId: 'a1',
      bankName: 'HDFC Bank',
      fdNumber: 'FD001',
      principalAmount: 100000,
      interestRate: 7.5,
      startDate: '2023-05-15',
      maturityDate: '2025-05-15',
      status: 'ACTIVE'
    },
    {
      id: 'fd2',
      accountId: 'a1',
      bankName: 'SBI',
      fdNumber: 'FD002',
      principalAmount: 250000,
      interestRate: 7.2,
      startDate: '2023-01-20',
      maturityDate: '2026-01-20',
      status: 'ACTIVE'
    },
    // Jane's FDs
    {
      id: 'fd3',
      accountId: 'a4',
      bankName: 'ICICI Bank',
      fdNumber: 'FD003',
      principalAmount: 150000,
      interestRate: 7.4,
      startDate: '2022-11-30',
      maturityDate: '2024-11-30',
      status: 'ACTIVE'
    },
    {
      id: 'fd4',
      accountId: 'a4',
      bankName: 'Axis Bank',
      fdNumber: 'FD004',
      principalAmount: 300000,
      interestRate: 7.3,
      startDate: '2023-08-01',
      maturityDate: '2025-08-01',
      status: 'ACTIVE'
    },
    // Family FD
    {
        id: 'fd5',
        accountId: 'a1', // Assuming joint account or linked to main member
        bankName: 'Union Bank',
        fdNumber: 'FD005',
        principalAmount: 500000,
        interestRate: 7.0,
        startDate: '2023-03-01',
        maturityDate: '2026-03-01',
        status: 'ACTIVE'
    }
  ],
  holdings: [
    // John's Indian Equities
    {
      id: 'h1',
      accountId: 'a2',
      assetClass: 'EQUITY',
      name: 'Reliance Industries',
      symbol: 'RELIANCE',
      quantity: 100,
      averagePrice: 2400,
      lastPrice: 2900,
      currency: 'INR'
    },
    {
      id: 'h2',
      accountId: 'a2',
      assetClass: 'EQUITY',
      name: 'HDFC Bank',
      symbol: 'HDFCBANK',
      quantity: 200,
      averagePrice: 1500,
      lastPrice: 1450,
      currency: 'INR'
    },
    // John's US Stocks
    {
      id: 'h5',
      accountId: 'a3',
      assetClass: 'US_EQUITY',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      quantity: 50,
      averagePrice: 150,
      lastPrice: 175,
      currency: 'USD'
    },
    {
      id: 'h6',
      accountId: 'a3',
      assetClass: 'US_EQUITY',
      name: 'Microsoft Corp',
      symbol: 'MSFT',
      quantity: 30,
      averagePrice: 280,
      lastPrice: 420,
      currency: 'USD'
    },
    // Jane's Indian Equities
    {
      id: 'h3',
      accountId: 'a5',
      assetClass: 'EQUITY',
      name: 'Tata Consultancy Services',
      symbol: 'TCS',
      quantity: 50,
      averagePrice: 3200,
      lastPrice: 3800,
      currency: 'INR'
    },
    {
      id: 'h4',
      accountId: 'a5',
      assetClass: 'EQUITY',
      name: 'Infosys',
      symbol: 'INFY',
      quantity: 150,
      averagePrice: 1400,
      lastPrice: 1600,
      currency: 'INR'
    },
    // Jane's US Stocks
    {
      id: 'h7',
      accountId: 'a6',
      assetClass: 'US_EQUITY',
      name: 'Alphabet Inc.',
      symbol: 'GOOGL',
      quantity: 40,
      averagePrice: 120,
      lastPrice: 160,
      currency: 'USD'
    },
    {
      id: 'h8',
      accountId: 'a6',
      assetClass: 'US_EQUITY',
      name: 'NVIDIA Corp',
      symbol: 'NVDA',
      quantity: 10,
      averagePrice: 400,
      lastPrice: 900,
      currency: 'USD'
    },
     // Junior's Holdings
     {
        id: 'h9',
        accountId: 'a7',
        assetClass: 'MUTUAL_FUND',
        name: 'SBI Bluechip Fund',
        symbol: 'SBIBLUE',
        quantity: 500,
        averagePrice: 40,
        lastPrice: 45,
        currency: 'INR'
     }
  ],
  realEstate: [
    {
        id: 're1',
        ownerMemberIds: ['m1', 'm2'],
        name: 'Apartment in Bandra',
        location: 'Mumbai, India',
        address: '123, Bandra West, Mumbai',
        purchaseDate: '2020-01-01',
        purchasePrice: 20000000,
        currentValue: 25000000,
        currency: 'INR',
        lastValuationDate: '2024-01-01',
        isSold: false
    },
    {
        id: 're2',
        ownerMemberIds: ['m2'],
        name: 'Farmhouse in Lonavala',
        location: 'Lonavala, India',
        address: 'XYZ Road, Lonavala',
        purchaseDate: '2018-06-01',
        purchasePrice: 5000000,
        currentValue: 7000000,
        currency: 'INR',
        lastValuationDate: '2023-10-01',
        isSold: false
    }
  ],
  trades: []
};