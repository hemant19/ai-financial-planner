import { Command } from 'commander';
import chalk from 'chalk';
import { DataService } from '../../app/services/data.service';
import { resolveMemberId } from '../utils/interactive';

export const portfolioCommand = new Command('portfolio')
  .description('View portfolio summaries and holdings');

portfolioCommand
  .command('summary')
  .description('Show a high-level summary of assets and net worth')
  .option('-m, --member-id <id>', 'Member ID (optional, defaults to Family)')
  .action(async (options) => {
    // Note: for summary, we allow null (Family), so we don't strictly NEED resolveMemberId 
    // unless we want to force selection. Let's make it optional.
    const memberId = options.memberId || null;
    
    console.log(chalk.blue(`Fetching portfolio summary for ${memberId || 'Family'}...`));
    
    const aggregates = await DataService.getAssetAggregates(memberId);
    const netWorth = await DataService.calculateNetWorth(memberId);
    const dailyChange = await DataService.calculateDailyChange(memberId);

    console.log('\n' + chalk.bold.underline('Portfolio Health Check'));
    console.log(`${chalk.gray('Net Worth:')}      ${chalk.green('₹' + netWorth.toLocaleString())}`);
    console.log(`${chalk.gray('Total Assets:')}   ₹${aggregates.total.toLocaleString()}`);
    
    const changeColor = dailyChange >= 0 ? chalk.green : chalk.red;
    console.log(`${chalk.gray('Day\'s Change:')}   ${changeColor((dailyChange >= 0 ? '+' : '') + '₹' + dailyChange.toLocaleString())}`);
    
    console.log('\n' + chalk.bold('Asset Allocation:'));
    const rows = [
        { label: 'Bank Balance', value: aggregates.bankBalance },
        { label: 'Fixed Deposits', value: aggregates.fixedDeposits },
        { label: 'Indian Equities', value: aggregates.indianEquities },
        { label: 'Mutual Funds', value: aggregates.mutualFunds },
        { label: 'US Stocks', value: aggregates.usStocks },
        { label: 'Real Estate', value: aggregates.realEstate },
    ];

    rows.forEach(r => {
        if (r.value > 0) {
            const pct = ((r.value / aggregates.total) * 100).toFixed(1);
            console.log(`- ${r.label.padEnd(18)}: ₹${r.value.toLocaleString().padStart(15)} (${pct}%)`);
        }
    });
    console.log('');
  });
