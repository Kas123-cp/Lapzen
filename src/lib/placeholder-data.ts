import type { Product } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// NOTE: This is now a simple JSON file-based "database" for prototyping.

// Define the path to the JSON file
const dataDir = path.join(process.cwd(), 'data');
const productsFilePath = path.join(dataDir, 'products.json');

// Helper to ensure the file exists
async function ensureProductsFile() {
  try {
    await fs.access(productsFilePath);
  } catch {
    // If the file doesn't exist, create the directory and the file with an empty array
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(productsFilePath, '[]', 'utf-8');
  }
}

// Function to get all products from the JSON file
export async function getProducts(): Promise<Product[]> {
  await ensureProductsFile();
  try {
    const json = await fs.readFile(productsFilePath, 'utf-8');
    // If the file is empty, return an empty array to avoid JSON parsing errors
    if (!json) {
        return [];
    }
    return JSON.parse(json);
  } catch (error) {
    console.error('Error reading or parsing products.json:', error);
    return []; // Return empty array on error
  }
}

// Function to save all products to the JSON file
export async function saveProducts(products: Product[]): Promise<void> {
  await ensureProductsFile();
  const json = JSON.stringify(products, null, 2);
  await fs.writeFile(productsFilePath, json, 'utf-8');
}
