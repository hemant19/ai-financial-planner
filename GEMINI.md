# AI Financial Planner

## Project Overview

**AI Financial Planner** is a comprehensive personal finance management system designed to track, analyze, and optimize investment portfolios. It combines a modern web dashboard with a powerful CLI for data ingestion and market intelligence.

**Key Capabilities:**
*   **Holistic Tracking:** Aggregates Indian Equities, US Stocks, Mutual Funds, Fixed Deposits, and Real Estate.
*   **Intelligent Analysis:** Features a custom "Analyst Engine" that scores stocks based on **Quality** (Fundamentals) and **Momentum** (Technicals).
*   **AI Advisor:** Integrates with **Google Gemini** (via Firebase Vertex AI) to provide personalized, context-aware financial advice through a chat interface.
*   **Data Independence:** Uses a local JSON file (`app/data/financial-data.json`) as the single source of truth, ensuring privacy and portability.

## Technology Stack

*   **Frontend:** [React Router v7](https://reactrouter.com/) (formerly Remix features)
*   **UI Library:** [Material UI v7](https://mui.com/) (Joy/Material)
*   **Data Visualization:** `@mui/x-charts`
*   **Runtime:** Node.js (v20+ recommended)
*   **Language:** TypeScript
*   **CLI:** `commander`, `inquirer`, `chalk`
*   **AI/ML:** Firebase Vertex AI (`firebase/ai`)
*   **Market Data:** `yahoo-finance2`, `kiteconnect`

## Architecture

### Directory Structure

*   **`app/`**: Frontend application source code.
    *   **`routes.ts`**: Route configuration (React Router v7 config-based routing).
    *   **`routes/`**: Page components (Dashboard, Equity Detail, Advisor, etc.).
    *   **`services/data.service.ts`**: The central data access layer. Handles reading/writing to the local JSON store and aggregating metrics.
    *   **`firebase.ts`**: Firebase initialization and AI service export.
    *   **`types.ts`**: Core TypeScript definitions (Holding, Member, Analysis, etc.).
    *   **`data/`**: Storage for the local database (`financial-data.json`).
*   **`cli/`**: Command Line Interface tools.
    *   **`index.ts`**: Entry point for the CLI.
    *   **`commands/`**: Command modules grouped by domain (`import`, `market`, `portfolio`, `members`).
    *   **`utils/analyst.ts`**: The **Analyst Engine**. Contains logic for calculating RSI, Moving Averages, and generating Buy/Sell verdicts.
    *   **`utils/interactive.ts`**: Helpers for interactive CLI prompts.

### Key Concepts

*   **The Analyst Engine:** When you run `market update`, the system doesn't just fetch prices. It fetches historical data (300 days) and financial statements to calculate:
    *   **Quality Score:** Based on ROE, Debt/Equity, P/E Ratio, and Revenue Growth.
    *   **Momentum Score:** Based on RSI, 50/200 DMA trends, and 52-week high proximity.
    *   **Verdict:** A derived action signal (BUY, ACCUMULATE, HOLD, TRIM, SELL).
*   **Dual-Score Strategy:** The system supports a "Core & Satellite" investing philosophy by exposing both Quality (for stability) and Momentum (for alpha) metrics.
*   **Smart Ingestion:** The CLI supports interactive imports from multiple brokers (Zerodha Kite, IIFL, IBKR) and handles currency conversion automatically.

## Development & Usage

### Prerequisites
*   Node.js (v20+)
*   npm
*   A Firebase project with Vertex AI enabled (for the Advisor feature).

### Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Environment:**
    Create a `.env` file with your Firebase credentials (see `app/firebase.ts` for required keys).

### Running the Application

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the web dashboard (frontend) in development mode. |
| `npm run cli` | Access the CLI tool (e.g., `npm run cli -- help`). |
| `npm run build` | Builds the web dashboard (frontend) for production. |
| `npm run start` | Starts the web dashboard (frontend) in production mode. |
| `npm run build -- --mode dev` | Builds the web dashboard (frontend) in development mode. |

### CLI Command Reference

The CLI is the power user's tool for managing the portfolio.

*   **Ingest Data:**
    *   `npm run cli -- import kite sync`: Sync holdings from Zerodha (Interactive login).
    *   `npm run cli -- import iifl <file.csv>`: Import IIFL Holdings CSV.
    *   `npm run cli -- import ibkr <file.tsv>`: Import Interactive Brokers TSV.
    *   `npm run cli -- import us-stocks <file.csv>`: Generic US Stock import.
    *   *Note: If you omit flags like `--member-id`, the CLI will prompt you interactively.*

*   **Market Intelligence:**
    *   `npm run cli -- market update`: Fetches latest prices, calculates daily change, and runs the **Analyst Engine** to update ratings.

*   **Portfolio Review:**
    *   `npm run cli -- portfolio summary`: Displays a quick terminal summary of Net Worth and Asset Allocation.

*   **Configuration:**
    *   `npm run cli -- members`: Manage family members.

## Contribution Guidelines

1.  **Conventions:** Follow strict TypeScript typing. All new data entities must be defined in `app/types.ts`.
2.  **Data Logic:** Business logic regarding asset calculations should reside in `DataService` or `cli/utils/analyst.ts`, not in the UI components.
3.  **UI:** Use Material UI components for consistency. Use the `Dashboard` layout for all new pages.
4.  **CLI:** Follow the "Intent-Centric" command structure (`import`, `market`, `view`) rather than "Vendor-Centric".
