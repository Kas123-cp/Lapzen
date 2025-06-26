import fs from 'fs/promises';
import path from 'path';

const authFilePath = path.join(process.cwd(), 'data', 'auth.json');

async function ensureAuthFile() {
  try {
    await fs.access(authFilePath);
  } catch {
    const dataDir = path.dirname(authFilePath);
    await fs.mkdir(dataDir, { recursive: true });
    const defaultCreds = { username: 'admin', password: 'password' };
    await fs.writeFile(authFilePath, JSON.stringify(defaultCreds, null, 2), 'utf-8');
  }
}

export async function getAuthCredentials() {
  await ensureAuthFile();
  try {
    const json = await fs.readFile(authFilePath, 'utf-8');
    return JSON.parse(json);
  } catch (error) {
    console.error('Error reading auth.json:', error);
    // In a real app, handle this more gracefully. For now, fallback to defaults.
    return { username: 'admin', password: 'password' }; 
  }
}

export async function saveAuthCredentials(credentials: {username: string, password: string}) {
  await ensureAuthFile();
  const json = JSON.stringify(credentials, null, 2);
  await fs.writeFile(authFilePath, json, 'utf-8');
}
