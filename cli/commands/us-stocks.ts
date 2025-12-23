import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import csv from 'csv-parser';
import { StorageService } from '@core/services/storage.service';
import { resolveMemberId } from '../utils/interactive';
import type { Holding } from '@core/types';

export const usStocksCommand = new Command('us-stocks');

usStocksCommand
  .command('import <file>')
  .option('-m, --member-id <id>', 'Member ID to map this account to')
  .description('Import US holdings from TSV/CSV')
  .action(async (file, options) => {
    const targetMemberId = await resolveMemberId(options.memberId);
    if (!targetMemberId) return;

    console.log(chalk.blue(`Importing US stock holdings from ${file} for member ID ${targetMemberId}...`));

    if (!await fs.pathExists(file)) {
      console.error(chalk.red(`File not found: ${file}`));
      return;
    }

    const appData = await StorageService.loadData();
    
    // Find Member
    let member = appData.members.find(m => m.id === targetMemberId);
    if (!member) {
       // Fallback by name
       member = appData.members.find(m => 
        m.displayName.toLowerCase().includes(targetMemberId.toLowerCase())
      );
    }

    if (!member) {
      console.error(chalk.red(`Member with ID or Name "${targetMemberId}" not found.`));
      return;
    }

    // Find or Create Account
    let account = appData.accounts.find(a => a.memberId === member!.id && a.institutionName === 'US_BROKER');
    if (!account) {
        console.log(chalk.blue(`Creating US Broker account for ${member.displayName}...`));
        account = {
            id: `acc_us_${member.id}`,
            memberId: member.id,
            type: 'US_BROKER',
            institutionName: 'US_BROKER',
            accountName: 'US Investment Account',
            currency: 'USD',
            isActive: true
        };
        appData.accounts.push(account);
    }

    const holdings: Holding[] = [];

    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (row: any) => {
        // Parsing logic for Generic US CSV/TSV
        // Assuming columns: Symbol, Quantity, Cost Basis, ...
        // Adapting based on common formats or user provided
        const symbol = row['Symbol'] || row['Ticker'];
        if (!symbol) return;

        const quantity = parseFloat(row['Quantity'] || row['Shares'] || '0');
        const avgPrice = parseFloat(row['Cost Basis'] || row['Avg Price'] || '0');
        // If current price is in file, use it, else default 0
        const lastPrice = parseFloat(row['Current Price'] || '0');

        if (quantity > 0) {
            holdings.push({
              id: `h_us_${symbol}_${member!.id}`,
              accountId: account!.id,
              assetClass: 'EQUITY', // Will be refined
              assetType: 'DIRECT',
              symbol: symbol,
              name: symbol, // Name often not in simple CSV
              quantity: quantity,
              averagePrice: avgPrice,
              lastPrice: lastPrice,
              currency: 'USD',
              lastUpdated: new Date().toISOString()
            });
        }
      })
      .on('end', async () => {
        try {
          // Remove existing holdings for this specific account
          appData.holdings = appData.holdings.filter(h => h.accountId !== account!.id);
          appData.holdings.push(...holdings);
          
          await StorageService.saveData(appData);
          console.log(chalk.green(`Successfully imported ${holdings.length} holdings for ${member!.displayName} (Account: US Stocks).`));
        } catch (error) {
          console.error(chalk.red('Error saving data:'), error);
        }
      });
  });