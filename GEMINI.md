# AI Financial Planner

## Project Overview

A modern, web-based personal finance tracker rewritten from a legacy Java application. It tracks investments, manages trades, and views portfolio performance using a serverless architecture.

**Goal:** Responsive, high-performance UI for tracking Net Worth, Assets, and Trades.

## Tech Stack

*   **Framework:** React Router v7 (Framework mode)
*   **Language:** TypeScript
*   **UI Library:** Material UI (MUI) v7.3.6
*   **Build Tool:** Vite
*   **Backend / Platform:** Firebase
    *   **Hosting:** Firebase Hosting (Web)
    *   **Database:** Cloud Firestore
    *   **Auth:** Firebase Auth
    *   **Storage:** Firebase Storage
    *   **Functions:** Firebase Cloud Functions (Initialized, currently empty)

## Architecture

*   **Type:** Client-Side SPA (Single Page Application).
*   **State:** Local React state + Context (e.g., `SelectionContext`).
*   **Persistence:** Direct Firestore access via `firebase/firestore` SDK in `app/services`.

## Data Model

The primary entity is **Member**. A **Family** is an optional grouping.

### Relationships
*   **Member** (1) ↔ (N) **Accounts**
*   **Member** (N) ↔ (0..1) **Family**
*   **Account** (1) ↔ (N) **Assets** (Fixed Deposits, Holdings)
*   **Account** (1) ↔ (N) **Trades**

### Interfaces (from `app/types.ts`)

#### 1. Family (`families`)
Optional top-level grouping.
```typescript
export interface Family {
  id: string;
  name: string;       // e.g., "Smith Family"
  baseCurrency: string; // e.g., "INR"
  createdAt: string;
  updatedAt: string;
}
```

#### 2. Member (`members`)
**Primary Entity**.
```typescript
export interface Member {
  id: string;
  familyId?: string;    // Optional link to Family
  displayName: string;
  relationship: string; // e.g., "Self", "Spouse"
  email?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}
```

#### 3. Account (`accounts`)
Unified collection for Banks, Demat, and Brokers.
```typescript
export type AccountType = 'BANK' | 'DEMAT' | 'US_BROKER';
export type Currency = 'INR' | 'USD' | 'EUR' | string;

export interface Account {
  id: string;
  memberId: string;
  type: AccountType;
  institutionName: string; // e.g., "HDFC", "Zerodha"
  accountName: string;     // e.g., "Salary Account"
  currency: Currency;
  currentBalance?: number; // For Bank Accounts
  linkedPlatformId?: string; // For Broker Accounts
  isActive: boolean;
}
```

#### 4. Fixed Deposit (`fixed_deposits`)
Linked to `BANK` accounts.
```typescript
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
```

#### 5. Holding (`holdings`)
Assets in `DEMAT` or `US_BROKER` accounts.
```typescript
export type AssetClass = 'EQUITY' | 'MUTUAL_FUND' | 'ETF' | 'BOND' | 'REIT' | 'US_EQUITY';

export interface Holding {
  id: string;
  accountId: string;
  assetClass: AssetClass;
  symbol: string;       // e.g., "RELIANCE"
  isin?: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currency: Currency;
  lastPrice?: number;   // Market data
  lastUpdated?: string;
}
```

#### 6. Real Estate (`real_estate`)
```typescript
export interface RealEstate {
  id: string;
  ownerMemberIds: string[];
  name: string;
  location: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: Currency;
  currentValue: number;
  isSold: boolean;
}
```

#### 7. Trade (`trades`)
Transaction history.
```typescript
export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  tradeDate: string;
  type: TradeType;
  quantity: number;
  price: number;
  currency: Currency;
  fees?: number;
  netAmount: number;
}
```

## Development & Deployment

### Scripts
*   **Dev Server:** `npm run dev` (Runs `react-router dev`)
*   **Build:** `npm run build`
*   **Typecheck:** `npm run typecheck`
*   **Deploy:** `firebase deploy`

### Implementation Notes
*   **IDs:** Use UUIDs or Firestore auto-IDs.
*   **Currency:** Handled at presentation layer. Consolidated views use `Family.baseCurrency`.

## Snippets

### MUI Grid v2
Use `size` prop instead of `xs`, `md`.

```tsx
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    <Item>Content</Item>
  </Grid>
</Grid>
```