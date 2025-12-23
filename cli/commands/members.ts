import { Command } from 'commander';
import chalk from 'chalk';
import { readData } from '../utils/file-manager';

export const membersCommand = new Command('members');

membersCommand
  .description('Manage family members')
  .action(async () => {
    try {
      const data = await readData();
      console.log(chalk.blue(`Members of family: ${data.family.name}`));
      console.log(chalk.yellow('ID'.padEnd(10) + ' | ' + 'Display Name'.padEnd(25) + ' | ' + 'Relationship'));
      console.log('-'.repeat(60));
      
      data.members.forEach(member => {
        console.log(
          member.id.padEnd(10) + ' | ' + 
          member.displayName.padEnd(25) + ' | ' + 
          member.relationship
        );
      });
    } catch (error) {
      console.error(chalk.red('Error listing members:'), error);
    }
  });
