# AI Financial planner

## Project Overview

This project is a modern, web-based rewrite of the original Finplan application. It aims to provide a faster iteration cycle and seamless deployment using a serverless architecture.

**Goal:** Track investments, manage trades, and view portfolio performance with a responsive, high-performance UI.

## Tech Stack

*   **Language:** TypeScript
*   **Frontend Framework:** React (bootstrapped with Vite)
*   **UI Library:** Material UI (MUI) v7.3.6
*   **Routing:** React Router v7 (Framework mode)
*   **Backend / Platform:** Firebase
    *   **Hosting:** Firebase Hosting for web hosting.
    *   **Authentication:** Firebase Auth (optional, for user management).
    *   **Database:** Cloud Firestore for database.
    *   **Storage:** Firebase Storage for storing any files.
    *   **Functions:** Firebase Cloud Functions (if server-side processing for Kite API integration is needed).
    *   **MCP:** Firebase MCP is available in the project which can be utilised when needed.
*   **Tools:**
    *   **MUI MCP:** The MCP server for MUI can be started using `npx -y @mui/mcp@latest`.

## Architecture

The application moves from a server-side rendered Java (Vaadin) app to a **Client-Side SPA (Single Page Application)**.

*   **Frontend:** Handles all UI logic, routing, and state management.
*   **Domain Logic:** Ported from Java to TypeScript, running primarily in the browser.
*   **Data Persistence:** Direct connection to Firestore using the Firebase SDK.

## Domain Model (TypeScript)

# Finplan Data Model (Refined)

This document outlines the revised data model, where a `Member` is the primary entity. A `Family` is an **optional** grouping unit for one or more `Members`. This allows for individual users who may later join or create a family unit.

## Entity Relationship Diagram (Conceptual)

*   **Member** (1) owns many **Accounts**
*   **Member** (1) can belong to zero or one **Family**
*   **Family** (1) groups many **Members** (optional)
*   **Account** (1) holds many **Assets** (Fixed Deposits, Holdings)
*   **Family** (1) owns many **Real Estate Assets** (can also be owned by individual members)
*   **Account** (1) has history of **Trades**

## Collections & Interfaces

The following interfaces represent the Firestore document structure.

### 1. Family (`families`)
Represents an **optional** top-level grouping unit for members.

```typescript
export interface Family {
  id: string;         // Document ID (UUID)
  name: string;       // e.g., "Smith Family"
  baseCurrency: string; // e.g., "INR" or "USD" - used for consolidated reporting
  createdAt: string;  // ISO 8601 Date String
  updatedAt: string;  // ISO 8601 Date String
}
```

### 2. Member (`members`)
Represents an individual user. This is the **primary entity**.

```typescript
export interface Member {
  id: string;           // Document ID
  familyId?: string;    // FK to Family (optional: if member belongs to a family)
  displayName: string;  // e.g., "John Doe"
  relationship: string; // e.g., "Self", "Spouse", "Child"
  email?: string;       // Optional: used for login/notifications
  avatarUrl?: string;   // Optional: Profile picture
  metadata?: Record<string, any>;
}
```

### 3. Account (`accounts`)
A unified collection for all financial containers (Banks, Brokers). The `type` field acts as a discriminator.

```typescript
export type AccountType = 'BANK' | 'DEMAT' | 'US_BROKER';
export type Currency = 'INR' | 'USD' | 'EUR' | string;

export interface Account {
  id: string;           // Document ID
  memberId: string;     // FK to Member
  type: AccountType;
  
  institutionName: string; // e.g., "HDFC Bank", "Zerodha", "Charles Schwab"
  accountName: string;     // e.g., "Salary Account", "Long Term Portfolio"
  accountNumberLast4?: string; // For display purposes
  currency: Currency;      // Default currency for assets in this account
  
  // Specific to Bank Accounts
  currentBalance?: number; // Cash available in the account
  
  // Specific to Broker Accounts (Demat/US)
  linkedPlatformId?: string; // e.g., Kite User ID
  
  isActive: boolean;
}
```

### 4. Fixed Deposit (`fixed_deposits`)
Represents a fixed income asset, typically linked to a `BANK` account.

```typescript
export interface FixedDeposit {
  id: string;
  accountId: string;    // FK to Account (Type: BANK)
  
  bankName: string;     // e.g. "SBI" (Can differ from parent account institution)
  fdNumber: string;     // Unique FD identifier
  
  principalAmount: number;
  interestRate: number; // Percentage (e.g., 7.5)
  
  startDate: string;    // ISO Date
  maturityDate: string; // ISO Date
  maturityAmount?: number; // Projected maturity value
  
  status: 'ACTIVE' | 'MATURED' | 'CLOSED';
}
```

### 5. Holding (`holdings`)
Represents current ownership of assets in `DEMAT` or `US_BROKER` accounts.

```typescript
export type AssetClass = 'EQUITY' | 'MUTUAL_FUND' | 'ETF' | 'BOND' | 'REIT' | 'US_EQUITY';

export interface Holding {
  id: string;
  accountId: string;    // FK to Account (Type: DEMAT or US_BROKER)
  
  assetClass: AssetClass;
  symbol: string;       // e.g., "RELIANCE", "AAPL"
  isin?: string;        // International Securities Identification Number
  name: string;         // Company Name e.g., "Apple Inc."
  
  quantity: number;
  averagePrice: number; // Cost basis per unit
  currency: Currency;   // Matches the parent Account currency
  
  // Market Data (Updated periodically/on-demand)
  lastPrice?: number;   // Current Market Price (CMP)
  lastUpdated?: string; // Timestamp of last price fetch
}
```

### 6. Real Estate (`real_estate`)
Represents property assets. Can be owned by one or more individual members or associated with a family.

```typescript
export interface RealEstate {
  id: string;
  ownerMemberIds: string[]; // Array of Member IDs who own this property
  
  name: string;           // e.g., "Apartment in Bandra"
  location: string;       // e.g., "Mumbai, India"
  address?: string;
  
  purchaseDate: string;   // ISO Date
  purchasePrice: number;
  currency: Currency;
  
  currentValue: number;   // Manually updated market value
  lastValuationDate: string; // ISO Date of last value update
  
  isSold: boolean;
}
```

### 7. Trade (`trades`)
Historical transaction log for auditing and tax calculations.

```typescript
export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  accountId: string;    // FK to Account
  
  symbol: string;
  isin?: string;
  tradeDate: string;    // ISO Date
  type: TradeType;
  
  quantity: number;
  price: number;        // Execution price
  currency: Currency;
  
  fees?: number;        // Brokerage, STT, etc.
  netAmount: number;    // Final flow amount
  exchange?: string;    // NSE, BSE, NASDAQ, NYSE
}
```

## Implementation Notes

1.  **Primary Entity:** `Member` is now the primary entity. All assets (Accounts, Holdings, Fixed Deposits) are directly linked to a `Member` via `memberId`.
2.  **Optional Family Grouping:** A `Family` is an optional construct. A `Member` can exist independently without a `familyId`, or belong to a `Family` by having its `familyId` field set.
3.  **Aggregation:**
    *   **Individual Net Worth:** To fetch an individual member's assets, the app fetches all Accounts for that specific `Member`, and then the Assets within those Accounts.
    *   **Family Net Worth:** To fetch family-wide assets, the app first identifies all `Members` belonging to a specific `Family` (via their `familyId`), then aggregates the data from all `Accounts` and `Assets` owned by those `Members`.
4.  **Currency Handling:** The app must handle currency conversion (e.g., USD -> INR) at the presentation layer or via a cloud function for consolidated Net Worth display. The `Family.baseCurrency` (if a family exists) or the primary member's chosen currency (if individual) dictates the reporting currency.
5.  **IDs:** All IDs should be auto-generated by Firestore or UUIDs.

## Development

1.  **Run Locally:**
    ```bash
    npm run dev
    ```

## Deployment

Deployment is handled via Firebase CLI.

```bash
npm run build
firebase deploy
```

## MUI Grid Usage Example

The `Grid` component uses the `size` prop to define column spans, replacing the separate `xs`, `md`, etc. props.

Here's an example of how to use the Grid API:

```tsx
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function BasicGrid() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 8 }}>
          <Item>xs=6 md=8</Item>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <Item>xs=6 md=4</Item>
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <Item>xs=6 md=4</Item>
        </Grid>
        <Grid size={{ xs: 6, md: 8 }}>
          <Item>xs=6 md=8</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
```
