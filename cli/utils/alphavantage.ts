import chalk from 'chalk';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;

// Simple rate limiter: 5 calls per minute (12s per call) to be safe on free tier.
// We'll be slightly more aggressive (10s) and handle failures if needed, 
// but strictly 5/min is the limit.
const DELAY_MS = 12000; 

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAlphaVantage(params: Record<string, string>) {
  if (!API_KEY) {
    throw new Error('ALPHAVANTAGE_API_KEY environment variable is not set.');
  }

  const queryString = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
  const url = `${BASE_URL}?${queryString}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    if (data['Note']) {
      // API Limit Reached
      console.warn(chalk.yellow('Alpha Vantage API limit reached. Waiting 60s...'));
      await delay(60000);
      return fetchAlphaVantage(params); // Retry
    }

    if (data['Error Message']) {
      throw new Error(`API Error: ${data['Error Message']}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getGlobalQuote(symbol: string) {
  await delay(DELAY_MS);
  const data = await fetchAlphaVantage({ function: 'GLOBAL_QUOTE', symbol });
  return data['Global Quote'];
}

export async function getCompanyOverview(symbol: string) {
  await delay(DELAY_MS);
  const data = await fetchAlphaVantage({ function: 'OVERVIEW', symbol });
  return data; // Returns object directly
}

export async function getDailyHistory(symbol: string) {
  await delay(DELAY_MS);
  const data = await fetchAlphaVantage({ function: 'TIME_SERIES_DAILY', symbol, outputsize: 'full' });
  return data['Time Series (Daily)'];
}
