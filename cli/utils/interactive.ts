import inquirer from 'inquirer';
import { StorageService } from '@core/services/storage.service';

export async function resolveMemberId(providedId?: string): Promise<string | null> {
  const data = await StorageService.loadData();
  
  // 1. If provided and valid, return it.
  if (providedId) {
    const member = data.members.find(m => m.id === providedId);
    if (member) return member.id;
    console.log(`Member '${providedId}' not found. Please select from the list.`);
  }

  // 2. Interactive Selection
  const choices = data.members.map(m => ({
    name: `${m.displayName} (${m.relationship})`,
    value: m.id
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'memberId',
      message: 'Select the family member for this operation:',
      choices: choices
    }
  ]);

  return answer.memberId;
}
