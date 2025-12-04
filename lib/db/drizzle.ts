import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL || !process.env.POSTGRES_URL_STOCK_ANALYSIS) {
	throw new Error(
		'POSTGRES_URL or POSTGRES_URL_STOCK_ANALYSIS environment variable is not set'
	);
}

const client = postgres(process.env.POSTGRES_URL);
export const db = drizzle(client, { schema });

const stockAnalysisClient = postgres(process.env.POSTGRES_URL_STOCK_ANALYSIS);
export const stockAnalysisDb = drizzle(stockAnalysisClient);
