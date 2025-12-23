import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import http from 'http';
import inquirer from 'inquirer';
import { KiteConnect } from 'kiteconnect';
import { readData, writeData } from '../utils/file-manager';
import type { Holding } from '../../app/types';

const TOKENS_PATH = path.resolve('cli/data/kite-tokens.json');

interface KiteUser {
  userId: string;
  displayName: string;
  memberName: string;
  memberId: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  refreshToken: string;
}

export const kiteCommand = new Command('kite');

async function getKiteUsers(): Promise<KiteUser[]> {
  if (!await fs.pathExists(TOKENS_PATH)) {
    throw new Error(`Kite tokens file not found at ${TOKENS_PATH}`);
  }
  return fs.readJson(TOKENS_PATH);
}

async function saveKiteUsers(users: KiteUser[]) {
  await fs.writeJson(TOKENS_PATH, users, { spaces: 2 });
}

kiteCommand
  .command('login [userId]')
  .description('Login to Kite to generate access token for a specific user')
  .action(async (userId) => {
    try {
      const users = await getKiteUsers();
      let targetUserId = userId;

      if (!targetUserId) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'userId',
            message: 'Select Kite user to login:',
            choices: users.map(u => ({ name: `${u.displayName} (${u.userId})`, value: u.userId }))
          }
        ]);
        targetUserId = answers.userId;
      }

      const user = users.find(u => u.userId === targetUserId);
      if (!user) {
        console.error(chalk.red(`User ${targetUserId} not found.`));
        return;
      }

      console.log(chalk.blue(`Initiating login for ${user.displayName}...`));

      const kc = new KiteConnect({
        api_key: user.apiKey
      });

      const loginUrl = kc.getLoginURL();
      console.log(chalk.green('\nPlease visit the following URL to login:'));
      console.log(loginUrl);
      console.log(chalk.yellow('\nWaiting for callback on http://localhost:8080/kite/redirect ...'));

      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        if (url.pathname === '/kite/redirect') {
          const requestToken = url.searchParams.get('request_token');
          if (requestToken) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Login Successful! You can close this window.</h1>');

            console.log(chalk.green('Request token received. Generating session...'));

            try {
              const response = await kc.generateSession(requestToken, user.apiSecret);

              user.accessToken = response.access_token;
              if (response.refresh_token) {
                user.refreshToken = response.refresh_token;
              }

              await saveKiteUsers(users);
              console.log(chalk.green(`Access token saved for ${user.displayName}!`));
            } catch (err) {
              console.error(chalk.red('Error generating session:'), err);
            } finally {
              server.close();
              process.exit(0);
            }
          } else {
            res.writeHead(400);
            res.end('No request_token found');
          }
        }
      });

      server.listen(8080);

    } catch (error) {
      console.error(chalk.red('Error during login:'), error);
    }
  });

kiteCommand
  .command('sync [userId]')
  .description('Sync holdings from Zerodha Kite')
  .action(async (userId) => {
    try {
      const users = await getKiteUsers();
      let targetUserId = userId;

      if (!targetUserId) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'userId',
            message: 'Select user(s) to sync:',
            choices: [
                { name: 'Sync All Users', value: 'all' },
                ...users.map(u => ({ name: u.displayName, value: u.userId }))
            ]
          }
        ]);
        targetUserId = answers.userId;
      }

      console.log(chalk.blue('Syncing with Kite...'));
      const targetUsers = targetUserId === 'all' ? users : users.filter(u => u.userId === targetUserId);

      if (targetUsers.length === 0) {
        console.error(chalk.red('No matching users found.'));
        return;
      }

      const appData = await readData();
      let hasUpdates = false;

      for (const user of targetUsers) {
        if (!user.accessToken) {
          console.log(chalk.yellow(`Skipping ${user.displayName} (No access token). Run "kite login ${user.userId}" first.`));
          continue;
        }

        console.log(chalk.blue(`Syncing holdings for ${user.displayName}...`));
        const kc = new KiteConnect({
          api_key: user.apiKey,
          access_token: user.accessToken
        });

        try {
          const [equities, mfs] = await Promise.all([
            kc.getHoldings().catch(err => {
              console.error(chalk.red(`Failed to fetch equities for ${user.displayName}:`), err.message);
              return [];
            }),
            kc.getMFHoldings().catch(err => {
              console.error(chalk.red(`Failed to fetch mutual funds for ${user.displayName}:`), err.message);
              return [];
            })
            ]);
            
            // Match Member
            const member = appData.members.find(m => m.id === user.memberId) || 
                           appData.members.find(m => m.displayName.includes(user.memberName));
                           
            if (!member) {
                 console.warn(chalk.yellow(`Member ID "${user.memberId}" or Name "${user.memberName}" not found in app data. Skipping.`));
                 continue;
            }

          // Find or Create Account
          let account = appData.accounts.find(a => a.memberId === member.id && a.institutionName === 'Zerodha');
          if (!account) {
            console.log(chalk.blue(`Creating Zerodha account for ${member.displayName}...`));
            account = {
              id: `acc_kite_${user.userId}`,
              memberId: member.id,
              type: 'DEMAT',
              institutionName: 'Zerodha',
              accountName: 'Kite',
              currency: 'INR',
              isActive: true
            };
            appData.accounts.push(account);
          }

          // Replace Holdings
          // Remove existing holdings for this specific account
          appData.holdings = appData.holdings.filter(h => h.accountId !== account!.id);

          const equityHoldings: Holding[] = equities.map((h: any) => ({
            id: `h_${h.isin}_${user.userId}`,
            accountId: account!.id,
            assetClass: 'EQUITY',
            symbol: h.tradingsymbol,
            isin: h.isin,
            name: h.company_name || h.tradingsymbol,
            quantity: h.quantity,
            averagePrice: h.average_price,
            currency: 'INR',
            lastPrice: h.last_price,
            lastUpdated: new Date().toISOString()
          }));

          const mfHoldings: Holding[] = mfs.map((h: any) => ({
            id: `h_mf_${h.isin}_${user.userId}`,
            accountId: account!.id,
            assetClass: 'MUTUAL_FUND',
            symbol: h.tradingsymbol || h.fund,
            isin: h.isin,
            name: h.fund,
            quantity: h.quantity,
            averagePrice: h.average_price,
            currency: 'INR',
            lastPrice: h.last_price,
            lastUpdated: new Date().toISOString()
          }));

          const newHoldings = [...equityHoldings, ...mfHoldings];
          appData.holdings.push(...newHoldings);
          hasUpdates = true;
          console.log(chalk.green(`Synced ${equityHoldings.length} equities and ${mfHoldings.length} mutual funds for ${user.displayName}.`));

        } catch (err: any) {
          console.error(chalk.red(`Failed to sync ${user.displayName}:`), err.message || err);
          if (err.status === 403) {
            console.log(chalk.yellow(`Token might be expired for ${user.userId}. Please login again.`));
          }
        }
      }

      if (hasUpdates) {
        await writeData(appData);
        console.log(chalk.green('All syncs completed and data saved.'));
      } else {
        console.log(chalk.yellow('No data updated.'));
      }

    } catch (error) {
      console.error(chalk.red('Error syncing with Kite:'), error);
    }
  });
