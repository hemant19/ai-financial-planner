import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import csv from 'csv-parser';
import { readData, writeData } from '../utils/file-manager';
import { resolveMemberId } from '../utils/interactive';
import type { Holding } from '../../app/types';

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

    const appData = await readData();
    // Try finding by ID first
    let member = appData.members.find(m => m.id === targetMemberId);

    // Fallback: Try finding by name
    if (!member) {
       member = appData.members.find(m => 
        m.displayName.toLowerCase().includes(targetMemberId.toLowerCase())
      );
    }

    if (!member) {
      console.error(chalk.red(`Member with ID or Name "${targetMemberId}" not found.`));
      return;
    }

    // Find or create US Broker account
    let account = appData.accounts.find(a => a.memberId === member.id && a.type === 'US_BROKER');
    if (!account) {
      console.log(chalk.blue(`Creating US Broker account for ${member.displayName}...`));
      account = {
        id: `acc_us_${member.id}`,
        memberId: member.id,
        type: 'US_BROKER',
        institutionName: 'US Broker', // Generic name or infer?
        accountName: 'US Stocks',
        currency: 'USD',
        isActive: true
      };
      appData.accounts.push(account);
    }

    const trades: Trade[] = [];
    const portfolio: Record<string, { quantity: number, totalCost: number, avgPrice: number }> = {};

    console.log(chalk.blue('Processing trades...'));

    fs.createReadStream(file)
      .pipe(csv({ separator: '\t' })) // Assuming TSV based on copy-paste, checking headers might be safer
      .on('headers', (headers) => {
          // simple check if it looks like CSV or TSV
          if (headers.length === 1 && headers[0].includes(',')) {
              // It's likely comma separated, but we initialized with tab. 
              // This is a limitation of simple pipe.
              // For now, I'll stick to TSV as the user data pasted looks like it.
              // If needed we can make it an option.
          }
      })
      .on('data', (row: any) => {
        // Map loose headers if needed, or rely on strict matching
        const dateStr = row['Transaction Date'];
        const type = row['Transaction Type']?.toUpperCase();
        const symbol = row['Stock'];
        const qty = parseFloat(row['Quantity']);
        const price = parseCurrency(row['Buy Price'] || row['Price'] || row['Amount']); // Fallback

        if (!symbol || !type || isNaN(qty)) return;

        // Track Trade
        trades.push({
            id: `tr_us_${symbol}_${dateStr}_${Math.random().toString(36).substr(2, 5)}`,
            accountId: account!.id,
            symbol,
            tradeDate: parseDate(dateStr),
            type: type as 'BUY' | 'SELL',
            quantity: qty,
            price: price,
            currency: 'USD',
            netAmount: price * qty,
            exchange: 'US'
        });

        // Update Portfolio (Holdings Calculation)
        if (!portfolio[symbol]) {
            portfolio[symbol] = { quantity: 0, totalCost: 0, avgPrice: 0 };
        }

        const position = portfolio[symbol];

        if (type === 'BUY') {
            position.totalCost += (qty * price);
            position.quantity += qty;
            position.avgPrice = position.totalCost / position.quantity;
        } else if (type === 'SELL') {
            position.quantity -= qty;
            if (position.quantity <= 0) {
                 position.quantity = 0;
                 position.totalCost = 0;
                 position.avgPrice = 0;
            } else {
                 // On sell, total cost reduces proportionally
                 position.totalCost = position.quantity * position.avgPrice;
            }
        }
      })
      .on('end', async () => {
        // Convert portfolio to Holdings
        const newHoldings: Holding[] = Object.entries(portfolio)
            .filter(([_, data]) => data.quantity > 0.001) // Filter out closed positions
            .map(([symbol, data]) => ({
                id: `h_us_${symbol}_${member.id}`,
                accountId: account!.id,
                assetClass: 'US_EQUITY',
                symbol: symbol,
                name: symbol, // Could fetch name if needed
                quantity: data.quantity,
                averagePrice: data.avgPrice,
                currency: 'USD',
                lastUpdated: new Date().toISOString()
                // lastPrice is missing, would need a fetch or manual update. 
                // For now, leave undefined or use avgPrice as placeholder? 
                // Better undefined so UI can handle it or we fetch it later.
            }));

        // Update App Data
        // 1. Clear old US holdings for this account
        appData.holdings = appData.holdings.filter(h => h.accountId !== account!.id);
        appData.holdings.push(...newHoldings);

        // 2. Add trades (optional, but good for history)
        // Check if we should replace trades or append. 
        // For simplicity, let's filter out old US trades for this account and replace.
        appData.trades = appData.trades.filter(t => t.accountId !== account!.id);
        appData.trades.push(...trades);

        await writeData(appData);
        console.log(chalk.green(`Imported ${trades.length} trades.`));
        console.log(chalk.green(`Updated ${newHoldings.length} US holdings for ${member.displayName}.`));
      });
  });
