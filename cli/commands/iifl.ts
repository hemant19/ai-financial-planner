import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import csv from 'csv-parser';
import { StorageService } from '@core/services/storage.service';
import { resolveMemberId } from '../utils/interactive';
import type { Holding } from '@core/types';

export const iiflCommand = new Command('iifl');

iiflCommand
  .command('import <file>')
  .option('-m, --member-id <id>', 'Member ID to map this account to')
  .description('Import holdings from IIFL CSV')
  .action(async (file, options) => {
    const targetMemberId = await resolveMemberId(options.memberId);
    if (!targetMemberId) return;

    console.log(chalk.blue(`Importing IIFL holdings from ${file} for member ID ${targetMemberId}...`));

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
    let account = appData.accounts.find(a => a.memberId === member!.id && a.institutionName === 'IIFL');
    if (!account) {
        console.log(chalk.blue(`Creating IIFL account for ${member.displayName}...`));
        account = {
            id: `acc_iifl_${member.id}`,
            memberId: member.id,
            type: 'DEMAT',
            institutionName: 'IIFL',
            accountName: 'IIFL Securities',
            currency: 'INR',
            isActive: true
        };
        appData.accounts.push(account);
    }

    const holdings: Holding[] = [];

    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (row: any) => {
        // ... (Parsing logic remains the same, assuming standard IIFL format)
        // For brevity in refactor, keeping generic parsing structure or re-implementing if needed.
        // Assuming row keys match standard IIFL report.
        const symbol = row['Symbol'] || row['Scrip Name'];
        if (!symbol) return;

        const quantity = parseFloat(row['Quantity'] || row['Qty'] || '0');
        const avgPrice = parseFloat(row['Avg Rate'] || row['Avg. Cost'] || '0');
        const lastPrice = parseFloat(row['LTP'] || row['Current Rate'] || '0');
        const isin = row['ISIN'];

        if (quantity > 0) {
            holdings.push({
              id: `h_iifl_${isin || symbol}_${member!.id}`,
              accountId: account!.id,
              assetClass: 'EQUITY', // Default
              symbol: symbol,
              isin: isin,
              name: row['Scrip Name'] || symbol,
              quantity: quantity,
              averagePrice: avgPrice,
              lastPrice: lastPrice,
              currency: 'INR',
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
          console.log(chalk.green(`Successfully imported ${holdings.length} holdings for ${member!.displayName} (Account: IIFL).`));
        } catch (error) {
          console.error(chalk.red('Error saving data:'), error);
        }
      });
  });