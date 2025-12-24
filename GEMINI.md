# AI Financial Planner

## Project Overview

**AI Financial Planner** is a hybrid personal finance management system that combines a local-first CLI for data ingestion with a modern React web dashboard for visualization and analysis. It is designed for privacy (local data ownership) and high-performance financial analysis (custom "Analyst Engine").

## Technology Stack

*   **Frontend:** React 19, React Router v7, Material UI v7 (Joy/Material), `@mui/x-charts`.
*   **Backend/CLI:** Node.js (v20+), Commander.js, Inquirer.js.
*   **Core Logic:** TypeScript shared library (`@core`).
*   **Data Storage:** Local JSON file (`core/src/data/financial-data.json`) serving as the single source of truth.
*   **AI:** Firebase Vertex AI (Gemini) for the "Advisor" chat feature.
*   **Build Tool:** Vite.

## Architecture

The project is structured as a monorepo-like workspace with three main layers:

1.  **Core (`core/`)**:
    *   Shared business logic, types, and data access.
    *   **Path Alias:** `@core/*` -> `core/src/*`.
    *   **Key Files:**
        *   `services/data.service.ts`: Centralizes all reads/writes to `financial-data.json`. Calculates Net Worth, Asset Allocation, etc.
        *   `types.ts`: Defines the strict TypeScript interfaces for `Holding`, `Member`, `Portfolio`, etc.
        *   `data/financial-data.json`: The database.

2.  **Web Application (`app/`)**:
    *   Modern React application using React Router v7.
    *   **Path Alias:** `~/*` -> `app/*`.
    *   **Structure:**
        *   `routes/`: Page components (Dashboard, Equity Detail, Advisor).
        *   `context/`: React Context for state (e.g., `SelectionContext` for filtering by family member).
        *   `components/`: Reusable UI elements.

3.  **CLI (`cli/`)**:
    *   Data ingestion and management tools.
    *   **Entry Point:** `cli/index.ts`.
    *   **Capabilities:** Importing broker statements (Zerodha, IIFL, IBKR), fetching market data (Yahoo Finance, Kite), and managing users.

## Development & Usage

### Prerequisites
*   Node.js v20+
*   npm

### Key Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the web dashboard in development mode. |
| `npm run build` | Builds the web application for production. |
| `npm run start` | Serves the built web application. |
| `npm run cli -- <command>` | Runs the CLI tool. (e.g., `npm run cli -- help`) |
| `npm run typecheck` | Runs TypeScript type checking across the project. |

### CLI Workflow

The CLI is the primary method for adding data to the system.

**Prerequisite:** You must set the `ALPHAVANTAGE_API_KEY` environment variable to fetch market data.
```bash
export ALPHAVANTAGE_API_KEY=your_key_here
```

1.  **Ingest Data:**
    *   `npm run cli -- import kite sync` (Syncs directly from Zerodha)
    *   `npm run cli -- import iifl <path-to-csv>`
    *   `npm run cli -- import ibkr <path-to-tsv>`
2.  **Update Market Data:**
    *   `npm run cli -- market update` (Fetches live prices and runs the Analyst Engine)
3.  **View Portfolio:**
    *   `npm run cli -- portfolio summary`

### The Analyst Engine

Located in `cli/utils/analyst.ts` (and partly in `core`), this engine computes two key scores for every equity holding:
*   **Quality Score:** Fundamental analysis (ROE, Debt/Equity, P/E, Growth).
*   **Momentum Score:** Technical analysis (RSI, Moving Averages).
*   **Verdict:** Generates a signal (BUY, HOLD, SELL) based on the intersection of these scores.

## Conventions

### UI & Styling
*   **MUI v7 Grid:** This project uses the new `Grid` component (formerly Grid2). **NEVER use the deprecated `item` prop.**
    *   **Old (Wrong):** `<Grid item xs={12} md={6}>`
    *   **New (Correct):** `<Grid size={{ xs: 12, md: 6 }}>`
*   **Material Design:** Follow Material Design 3 principles for UI/UX.
*   **Consistency:** Use Material UI components (`@mui/material`) for all UI elements.

### Data & Logic
*   **Single Source of Truth:** All data modifications (CRUD) should go through `DataService` in `@core`. Do not write to the JSON file directly from UI components.
*   **Type Safety:** Use the shared types from `@core/types.ts`. Avoid `any`.
*   **Routing:** Follow React Router v7 conventions. New routes go in `app/routes.ts` or as files in `app/routes/`.
*   **Firebase:** Used primarily for Authentication and the GenAI Advisor features.
