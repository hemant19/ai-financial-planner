import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import csv from 'csv-parser';
import { readData, writeData } from '../utils/file-manager';
import { resolveMemberId } from '../utils/interactive';
import type { Holding } from '@core/types';

export const iiflCommand = new Command('iifl');

iiflCommand
  .command('csv <file>')
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

    const appData = await readData();
    // Try finding by ID first
    let member = appData.members.find(m => m.id === targetMemberId);

    // Fallback: Try finding by name (case-insensitive)
    if (!member) {
      member = appData.members.find(m =>
        m.displayName.toLowerCase().includes(targetMemberId.toLowerCase())
      );
    }

    if (!member) {
      console.error(chalk.red(`Member with ID or Name "${targetMemberId}" not found.`));
      console.log(chalk.blue('Available members:'));
      appData.members.forEach(m => console.log(`- ${m.id}: ${m.displayName}`));
      return;
    }

    // Find or Create Account
    let account = appData.accounts.find(a => a.memberId === member.id && a.institutionName === 'IIFL');
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
      .on('data', (row: IiflRow) => {
        // Only process rows that have a UserId and Instrument
        if (!row.UserId || !row.Instrument || row.Instrument.startsWith('Total')) return;

        const symbol = row.Instrument;
        const isEtf = symbol.includes('ETF');

        holdings.push({
          id: `h_iifl_${symbol}_${member.id}`,
          accountId: account!.id,
          assetClass: isEtf ? 'ETF' : 'EQUITY',
          symbol: symbol,
          name: symbol, // IIFL CSV doesn't have separate company name
          quantity: parseNumber(row.Qty),
          averagePrice: parseNumber(row['Avg Price']),
          lastPrice: parseNumber(row.LTP),
          currency: 'INR',
          lastUpdated: new Date().toISOString()
        });
      })
      .on('end', async () => {
        try {
          // Remove existing holdings for this specific account
          appData.holdings = appData.holdings.filter(h => h.accountId !== account!.id);

          appData.holdings.push(...holdings);

          await writeData(appData);
          console.log(chalk.green(`Successfully imported ${holdings.length} holdings for ${member.displayName} (Account: IIFL).`));
        } catch (error) {
          console.error(chalk.red('Error saving data:'), error);
        }
      })
      .on('error', (error) => {
        console.error(chalk.red('Error parsing CSV:'), error);
      });
  });
