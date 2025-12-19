# AI Financial Planner

## Project Overview

**AI Financial Planner** is a personal finance management application designed to help users track and analyze their financial assets, including Indian equities, mutual funds, US stocks, fixed deposits, and real estate.

**Current Status:** The project is in a **prototype phase**. It is currently operating with **mock data** and local state management. While Firebase configuration files exist, the integration is currently disabled in favor of static sample data for rapid UI/UX development.

## Technology Stack

- **Framework:** [React Router v7](https://reactrouter.com/) (formerly Remix features)
- **Language:** TypeScript
- **UI Library:** [Material UI v7](https://mui.com/) (Joy/Material)
- **Build Tool:** Vite
- **Runtime:** Node.js (for SSR/Serving)

## Architecture

### Directory Structure

- **`app/`**: Main application source code.
    - **`routes.ts`**: Route configuration (config-based routing).
    - **`routes/`**: Route components (pages).
    - **`components/`**: Reusable UI components.
    - **`context/`**: React Context providers (e.g., `AuthContext`, `SelectionContext`).
    - **`data/`**: Static sample data (`financial-data.ts`) used for the prototype.
    - **`services/`**: Data access layer (`data.service.ts`). Currently implements `FixedDataService` to serve mock data.
    - **`theme.ts`**: Material UI theme customization.
    - **`firebase.ts`**: Firebase initialization (currently commented out).
- **`public/`**: Static assets.

### Key Concepts

- **Routing:** Uses React Router v7 config-based routing defined in `app/routes.ts`.
- **Data Access:** Data fetching is abstracted through a `DataService`. The current implementation (`FixedDataService`) serves static data from `app/data/financial-data.ts`.
- **Authentication:** Managed via `AuthContext`. Since Firebase Auth is disabled, this likely handles local/mock authentication states.
- **Styling:** Material UI components with a custom theme provider in `app/root.tsx`.

## Development

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with hot reload. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Runs the built application locally. |
| `npm run typecheck` | Runs TypeScript type checking. |

### Configuration

- **Firebase:** configured via `firebase.json` and `.firebaserc`, but strictly optional for the current prototype phase.
- **Environment Variables:** See `.env` (if exists) or `vite.config.ts` for build-time configuration.

## Contribution Guidelines

1.  **Conventions:** Follow existing TypeScript strict mode patterns.
2.  **UI:** Use Material UI components for consistency.
3.  **Data:** When adding new features, extend the `sampleData` in `app/data/financial-data.ts` and update `FixedDataService` to expose it. Do not connect to live backends without updating the architecture to support it.
