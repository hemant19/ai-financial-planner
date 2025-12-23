#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { importGroup } from './commands/import-group';
import { marketCommand } from './commands/market';
import { membersCommand } from './commands/members';
import { portfolioCommand } from './commands/portfolio';

const program = new Command();

program
  .name('finance-cli')
  .description('AI Financial Planner CLI - Version 2.0')
  .version('2.0.0');

// --- 1. Ingestion Layer ---
program.addCommand(importGroup);

// --- 2. Market Data Layer ---
program.addCommand(marketCommand);

// --- 3. View Layer ---
program.addCommand(portfolioCommand);

// --- 4. Configuration Layer ---
program.addCommand(membersCommand);

program.command('status')
  .description('Check system health')
  .action(async () => {
    console.log(chalk.green('✔ CLI is ready.'));
    console.log(chalk.gray('Use "finance-cli import --help" to ingest data.'));
    console.log(chalk.gray('Use "finance-cli market update" to refresh prices.'));
  });

program.parse();
