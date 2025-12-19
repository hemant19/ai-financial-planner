import fs from 'fs-extra';
import path from 'path';
import type { SampleData } from '../../app/types';

const DATA_PATH = path.resolve('app/data/financial-data.json');

export async function readData(): Promise<SampleData> {
  if (!await fs.pathExists(DATA_PATH)) {
    throw new Error(`Data file not found at ${DATA_PATH}`);
  }
  return fs.readJson(DATA_PATH);
}

export async function writeData(data: SampleData): Promise<void> {
  await fs.writeJson(DATA_PATH, data, { spaces: 2 });
  console.log(`Data updated at ${DATA_PATH}`);
}
