import fs from 'fs/promises';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'data.json');

export async function getDbData() {
  try {
    const fileContents = await fs.readFile(DB_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Database read error:", error);
    return null;
  }
}

export async function saveDbData(data: any) {
  try {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Database write error:", error);
    return false;
  }
}
