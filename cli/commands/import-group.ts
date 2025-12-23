import { Command } from 'commander';
import { kiteCommand } from './kite';
import { iiflCommand } from './iifl';
import { ibkrCommand } from './ibkr';
import { usStocksCommand } from './us-stocks';

export const importGroup = new Command('import')
  .description('Ingest financial data from various sources');

// Attach existing commands as sub-commands
importGroup.addCommand(kiteCommand);
importGroup.addCommand(iiflCommand);
importGroup.addCommand(ibkrCommand);
importGroup.addCommand(usStocksCommand); 
