import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import csv from 'csv-parser';
import { StorageService } from '@core/services/storage.service';
import { resolveMemberId } from '../utils/interactive';
import type { Holding } from '@core/types';

export const ibkrCommand = new Command('ibkr');

interface IbkrRow {
  Stock: string;
  'Shares Held': string;
  'Avg Buy Price': string;
  'Current Price': string;
}

function parseCurrency(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[$,]/g, '').trim());
}

ibkrCommand
  .command('import <file>')
  .option('-m, --member-id <id>', 'Member ID to map this account to')
  .description('Import holdings from IBKR TSV')
  .action(async (file, options) => {
    const targetMemberId = await resolveMemberId(options.memberId);
    if (!targetMemberId) return;

    console.log(chalk.blue(`Importing IBKR holdings from ${file} for member ID ${targetMemberId}...`));

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
    let account = appData.accounts.find(a => a.memberId === member!.id && a.institutionName === 'IBKR');
    if (!account) {
        console.log(chalk.blue(`Creating IBKR account for ${member.displayName}...`));
        account = {
            id: `acc_ibkr_${member.id}`,
            memberId: member.id,
            type: 'US_BROKER',
            institutionName: 'IBKR',
            accountName: 'Interactive Brokers',
            currency: 'USD',
            isActive: true
        };
        appData.accounts.push(account);
    }

    const holdings: Holding[] = [];

    fs.createReadStream(file)
      .pipe(csv({ separator: '\t' }))
      .on('data', (row: IbkrRow) => {
        const symbol = row.Stock;
        if (!symbol) return;

        const quantity = parseFloat(row['Shares Held']);
        const avgPrice = parseCurrency(row['Avg Buy Price']);
        const currentPrice = parseCurrency(row['Current Price']);

        holdings.push({
          id: `h_ibkr_${symbol}_${member!.id}`,
          accountId: account!.id,
          assetClass: 'EQUITY', // Default, will be refined by market update
          symbol: symbol,
          name: symbol,
          quantity: quantity,
          averagePrice: avgPrice,
          lastPrice: currentPrice,
          currency: 'USD',
          lastUpdated: new Date().toISOString()
        });
      })
      .on('end', async () => {
        try {
          // Remove existing holdings for this specific account
          appData.holdings = appData.holdings.filter(h => h.accountId !== account!.id);
          appData.holdings.push(...holdings);
          
          await StorageService.saveData(appData);
          console.log(chalk.green(`Successfully imported ${holdings.length} holdings for ${member!.displayName} (Account: IBKR).`));
        } catch (error) {
          console.error(chalk.red('Error saving data:'), error);
        }
      })
      .on('error', (error) => {
        console.error(chalk.red('Error parsing CSV:'), error);
      });
  });
