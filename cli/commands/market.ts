import { Command } from 'commander';
import chalk from 'chalk';
// @ts-ignore
import YahooFinance from 'yahoo-finance2';
import { readData, writeData } from '../utils/file-manager';
import { analyzeStock, FinancialData } from '../utils/analyst';

// @ts-ignore
const yahooFinance = new YahooFinance();

async function updatePricesAction() {
  console.log(chalk.blue('Starting price update via Yahoo Finance...'));

  try {
    const appData = await readData();
    let updatedCount = 0;

    // Group holdings by Yahoo ticker to batch requests if needed,
    // or just to avoid duplicate fetches.
    const symbolMap = new Map<string, string[]>(); // YahooTicker -> Array of Holding IDs

    // 1. Process Stocks (Equities, ETFs, US Stocks)
    appData.holdings.forEach(h => {
      let yahooSymbol = '';

      // Special Handling for SGB (Sovereign Gold Bonds)
      if (h.symbol.startsWith('SGB')) {
        // SGBs will be handled separately via Gold Proxy
        return;
      }

      if (h.assetClass === 'US_EQUITY') {
        yahooSymbol = h.symbol;
      } else if (['EQUITY', 'ETF'].includes(h.assetClass)) {
        if (h.symbol === 'NSDL') {
          yahooSymbol = 'NSDL.BO'; // NSDL is on BSE
        } else {
          // Normalize: 'RELIANCE-EQ' -> 'RELIANCE' -> 'RELIANCE.NS'
          const cleanSymbol = h.symbol.replace(/-EQ$/, '').replace(/-BL$/, '');
          yahooSymbol = `${cleanSymbol}.NS`;
        }
      }

      if (yahooSymbol) {
        if (!symbolMap.has(yahooSymbol)) {
          symbolMap.set(yahooSymbol, []);
        }
        symbolMap.get(yahooSymbol)?.push(h.id);
      }
    });

    // 2. Process SGBs (Gold Proxy)
    const sgbHoldings = appData.holdings.filter(h => h.symbol.startsWith('SGB'));
    if (sgbHoldings.length > 0) {
      console.log(chalk.blue(`Updating ${sgbHoldings.length} SGB holdings using Gold Futures proxy...`));
      try {
        const quotes = await yahooFinance.quote(['GC=F', 'INR=X']);
        const goldQuote = quotes.find(q => q.symbol === 'GC=F');
        const inrQuote = quotes.find(q => q.symbol === 'INR=X');

        if (goldQuote && inrQuote && goldQuote.regularMarketPrice && inrQuote.regularMarketPrice) {
          const goldUsd = goldQuote.regularMarketPrice;
          const usdInr = inrQuote.regularMarketPrice;
          const pricePerGram = (goldUsd * usdInr) / 31.1035;

          // Approximate daily change % from the Gold Future itself
          const dayChangePercent = goldQuote.regularMarketChangePercent;
          const dayChange = (pricePerGram * (dayChangePercent || 0)) / 100;

          sgbHoldings.forEach(h => {
            h.lastPrice = pricePerGram;
            h.dayChange = dayChange;
            h.dayChangePercent = dayChangePercent;
            h.lastUpdated = new Date().toISOString();
            updatedCount++;
          });
          console.log(chalk.gray(`Updated SGBs: ₹${pricePerGram.toFixed(2)}/g (based on Gold $${goldUsd}, USD ${usdInr})`));
        } else {
          console.error(chalk.yellow('Failed to fetch Gold/USD rates for SGB update.'));
        }
      } catch (err: any) {
        console.error(chalk.red('Error updating SGBs:'), err.message);
      }
    }

    // 3. Process Mutual Funds (Search by ISIN)
    const mfHoldings = appData.holdings.filter(h => h.assetClass === 'MUTUAL_FUND' && h.isin);
    if (mfHoldings.length > 0) {
      console.log(chalk.blue(`Searching for ${mfHoldings.length} Mutual Funds on Yahoo Finance...`));

      for (const h of mfHoldings) {
        try {
          const result = await yahooFinance.search(h.isin!);
          if (result.quotes && result.quotes.length > 0) {
            const quote = result.quotes[0];
            const yahooSymbol = quote.symbol as string;

            if (yahooSymbol) {
              if (!symbolMap.has(yahooSymbol)) {
                symbolMap.set(yahooSymbol, []);
              }
              symbolMap.get(yahooSymbol)?.push(h.id);
              console.log(chalk.gray(`Found ${h.name} -> ${yahooSymbol}`));
            }
          } else {
            console.log(chalk.yellow(`Could not find Yahoo symbol for MF: ${h.name} (${h.isin})`));
          }
        } catch (err) {
          console.error(chalk.yellow(`Error searching for MF ${h.name}:`), err);
        }
        // Small delay to be nice to the API
        await new Promise(r => setTimeout(r, 200));
      }
    }

    console.log(chalk.blue(`Fetching prices for ${symbolMap.size} unique symbols...`));

    // Fetch prices
    // Yahoo Finance rate limits can be tricky, so we'll process in chunks or sequentially if needed.
    // For now, Promise.all with a simple loop.
    const entries = Array.from(symbolMap.entries());

    // Process in batches of 3 to be polite to the API
    const BATCH_SIZE = 3;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async ([yahooSymbol, holdingIds]) => {
        try {
          const quote = await yahooFinance.quote(yahooSymbol);
          const price = quote.regularMarketPrice;
          const dayChange = quote.regularMarketChange;
          const dayChangePercent = quote.regularMarketChangePercent;

          if (price) {
            // Check if we should perform deep analysis (Equity/US Stocks)
            const sampleHolding = appData.holdings.find(h => h.id === holdingIds[0]);
            let analysisResult = undefined;

            if (sampleHolding && (sampleHolding.assetClass === 'EQUITY' || sampleHolding.assetClass === 'US_EQUITY')) {
              try {
                // Fetch additional data for analysis
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 300);

                const [summary, history] = await Promise.all([
                  yahooFinance.quoteSummary(yahooSymbol, { modules: ['financialData', 'defaultKeyStatistics'] }),
                  yahooFinance.historical(yahooSymbol, { period1: startDate, period2: new Date() })
                ]);

                const financials: FinancialData = {
                  currentPrice: price,
                  roe: summary.financialData?.returnOnEquity,
                  debtToEquity: summary.financialData?.debtToEquity,
                  peRatio: summary.defaultKeyStatistics?.trailingPE || summary.defaultKeyStatistics?.forwardPE,
                  revenueGrowth: summary.financialData?.revenueGrowth,
                  fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh
                };

                const prices = history.map((h: any) => h.close).filter((p: any) => p !== null && p !== undefined);
                analysisResult = analyzeStock(prices, financials);

              } catch (analysisErr: any) {
                // Silent fail for analysis, we still want price update
              }
            }

            holdingIds.forEach(id => {
              const holding = appData.holdings.find(h => h.id === id);
              if (holding) {
                holding.lastPrice = price;
                holding.dayChange = dayChange;
                holding.dayChangePercent = dayChangePercent;
                holding.lastUpdated = new Date().toISOString();
                if (analysisResult) {
                  holding.analysis = analysisResult;
                }
                updatedCount++;
              }
            });

            const analysisLog = analysisResult ? ` | Score: ${analysisResult.scores.total.toFixed(1)} (${analysisResult.verdict})` : '';
            console.log(chalk.gray(`Updated ${yahooSymbol}: ${price} (${dayChangePercent?.toFixed(2)}%)${analysisLog}`));
          }
        } catch (err: any) {
          console.error(chalk.yellow(`Failed to fetch ${yahooSymbol}: ${err.message}`));
        }
      }));

      if (i + BATCH_SIZE < entries.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Save
    if (updatedCount > 0) {
      await writeData(appData);
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
  .description('Fetch latest prices and run Analyst Engine')
  .action(updatePricesAction);
