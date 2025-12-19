#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { kiteCommand } from './commands/kite';
import { importCommand } from './commands/import';

const program = new Command();

program
  .name('finance-cli')
  .description('CLI to manage financial data for AI Financial Planner')
  .version('1.0.0');

program.addCommand(kiteCommand);
program.addCommand(importCommand);

program.command('status')
  .description('Check the status of the financial data file')
  .action(async () => {
    console.log(chalk.green('CLI is ready and operational!'));
    // TODO: Add logic to check file stats
  });

program.parse();
