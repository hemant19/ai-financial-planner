import { Command } from 'commander';
import chalk from 'chalk';
import { StorageService } from '@core/services/storage.service';
import { analyzeStock, FinancialData } from '../utils/analyst';
import { classifyHolding } from '../utils/classifier';
import { getCompanyOverview, getDailyHistory, getGlobalQuote } from '../utils/alphavantage';

async function updatePricesAction() {
  if (!process.env.ALPHAVANTAGE_API_KEY) {
    console.error(chalk.red('Error: ALPHAVANTAGE_API_KEY environment variable is required.'));
    console.log(chalk.gray('Get your free key at https://www.alphavantage.co/support/#api-key'));
    return;
  }

  console.log(chalk.blue('Starting price update via Alpha Vantage...'));
  console.log(chalk.yellow('Note: Free tier is limited to 5 calls/minute. This might take a while.'));

  try {
    const appData = await StorageService.loadData();
    let updatedCount = 0;

    // Group holdings by Symbol to avoid duplicate fetches
    const symbolMap = new Map<string, string[]>(); // Symbol -> Array of Holding IDs

    appData.holdings.forEach(h => {
      // Skip Mutual Funds and Commodities (SGBs) for now as AV support is limited/different
      if (h.assetClass === 'MUTUAL_FUND' || h.assetClass === 'COMMODITY' || h.symbol.startsWith('SGB')) {
          return;
      }

      let avSymbol = h.symbol;
      
      if (h.currency === 'INR') {
          // Alpha Vantage uses .BSE or .NS (often .BSE is more reliable on free tier for some reason, but let's try .BSE)
          // Actually, let's try to infer. If it was Yahoo .NS, maybe change to .BSE?
          // Let's stick to .BSE for Indian stocks to be safe, or just append .BSE
          // If the symbol already has suffix, strip it.
          const cleanSymbol = h.symbol.replace(/\.(NS|BSE|BO)$/, '').replace(/-EQ$/, '');
          avSymbol = `${cleanSymbol}.BSE`; 
      }

      if (!symbolMap.has(avSymbol)) {
        symbolMap.set(avSymbol, []);
      }
      symbolMap.get(avSymbol)?.push(h.id);
    });

    console.log(chalk.blue(`Fetching data for ${symbolMap.size} unique symbols...`));

    // Process sequentially
    for (const [symbol, holdingIds] of symbolMap.entries()) {
        try {
            console.log(chalk.gray(`Fetching ${symbol}...`));
            
            // 1. Get Price
            const quote = await getGlobalQuote(symbol);
            if (!quote || !quote['05. price']) {
                console.warn(chalk.yellow(`No quote found for ${symbol}`));
                continue;
            }

            const price = parseFloat(quote['05. price']);
            const dayChange = parseFloat(quote['09. change']);
            const dayChangePercent = parseFloat(quote['10. change percent'].replace('%', ''));
            const dateStr = quote['07. latest trading day']; // YYYY-MM-DD

            // 2. Deep Analysis (Equity/US Stocks)
            // Only fetch if we have a valid price
            let analysisResult = undefined;
            const sampleHolding = appData.holdings.find(h => h.id === holdingIds[0]);

            if (sampleHolding && (sampleHolding.assetClass === 'EQUITY' || (sampleHolding as any).assetClass === 'US_EQUITY')) {
                try {
                    // Fetch Overview
                    const overview = await getCompanyOverview(symbol);
                    // Fetch History
                    const history = await getDailyHistory(symbol);

                    if (overview && history) {
                        const financialData: FinancialData = {
                            currentPrice: price,
                            roe: overview['ReturnOnEquityTTM'] ? parseFloat(overview['ReturnOnEquityTTM']) / 100 : undefined, // AV returns 15.5 for 15.5%? Need to check. Usually number.
                            debtToEquity: undefined, // Not typically available in basic Overview
                            peRatio: overview['PERatio'] ? parseFloat(overview['PERatio']) : undefined,
                            revenueGrowth: overview['RevenueGrowthTTM'] ? parseFloat(overview['RevenueGrowthTTM']) : undefined,
                            fiftyTwoWeekHigh: overview['52WeekHigh'] ? parseFloat(overview['52WeekHigh']) : undefined
                        };

                        // Convert history object to array of closes
                        // "Time Series (Daily)": { "2023-10-25": { "4. close": "..." } }
                        const prices = Object.values(history)
                            .map((day: any) => parseFloat(day['4. close']))
                            .reverse(); // Newest first from API? No, object order is keys.
                            // Actually, Object.values might not be sorted. 
                            // Let's sort keys.
                        
                        const sortedDates = Object.keys(history).sort(); // Oldest first
                        const sortedPrices = sortedDates.map(d => parseFloat(history[d]['4. close']));

                        analysisResult = analyzeStock(sortedPrices, financialData);
                    }
                } catch (analysisErr: any) {
                    console.error(chalk.yellow(`Analysis failed for ${symbol}: ${analysisErr.message}`));
                }
            }

            // Update Holdings
            holdingIds.forEach(id => {
                const holding = appData.holdings.find(h => h.id === id);
                if (holding) {
                    // Populate assetType if missing
                    if (!holding.assetType) {
                        if ((holding.assetClass as any) === 'MUTUAL_FUND') holding.assetType = 'MUTUAL_FUND';
                        else if (['EQUITY', 'US_EQUITY'].includes(holding.assetClass as any)) holding.assetType = 'DIRECT';
                        else if (holding.symbol.toUpperCase().includes('ETF') || holding.symbol.toUpperCase().endsWith('BEES')) holding.assetType = 'ETF';
                    }

                    holding.lastPrice = price;
                    holding.dayChange = dayChange;
                    holding.dayChangePercent = dayChangePercent;
                    holding.lastUpdated = new Date().toISOString();
                    
                    // Run Classification (Market Cap not always available in Quote, check Overview?)
                    // Overview has 'MarketCapitalization'
                    // We didn't fetch Overview for all. Let's skip market cap based re-classification for now or fetch it if needed.
                    
                    if (analysisResult) {
                        holding.analysis = analysisResult;
                    }
                    updatedCount++;
                }
            });

            const analysisLog = (analysisResult && analysisResult.scores.total !== undefined) ? ` | Score: ${analysisResult.scores.total.toFixed(1)} (${analysisResult.verdict})` : '';
            console.log(chalk.green(`Updated ${symbol}: ${price} (${dayChangePercent.toFixed(2)}%)${analysisLog}`));

        } catch (err: any) {
            console.error(chalk.red(`Failed to fetch ${symbol}: ${err.message}`));
        }
    }

    if (updatedCount > 0) {
        await StorageService.saveData(appData);
        console.log(chalk.green(`Successfully updated prices for ${updatedCount} holdings.`));
    } else {
        console.log(chalk.yellow('No prices updated.'));
    }

  } catch (error) {
    console.error(chalk.red('Error updating prices:'), error);
  }
}

export const marketCommand = new Command('market')
  .description('Manage external market data and analysis');

marketCommand.command('update')
  .description('Fetch latest prices and run Analyst Engine (Alpha Vantage)')
  .action(updatePricesAction);