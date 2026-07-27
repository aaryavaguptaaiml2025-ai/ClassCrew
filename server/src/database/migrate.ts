import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { logger } from '../config/logger.js';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  logger.info('Starting ClassCrew Database Migration...');

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    logger.warn('================================================================');
    logger.warn('⚠️  DATABASE_URL is not set in server/.env');
    logger.warn('To run migrations automatically from the CLI:');
    logger.warn('  Add DATABASE_URL=postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres to server/.env');
    logger.warn('Alternatively, copy and run the SQL files in Supabase SQL Editor:');
    logger.warn(`  1. Schema SQL: ${join(__dirname, 'migrations', '001_initial_schema.sql')}`);
    logger.warn(`  2. Seed SQL:   ${join(__dirname, 'migrations', '002_seed_data.sql')}`);
    logger.warn('================================================================');
    process.exit(0);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    logger.info('Connecting to PostgreSQL database...');
    await client.connect();
    logger.info('Connected successfully.');

    // 1. Run 001_initial_schema.sql
    const schemaFile = join(__dirname, 'migrations', '001_initial_schema.sql');
    logger.info(`Executing schema file: 001_initial_schema.sql`);
    const schemaSql = readFileSync(schemaFile, 'utf-8');
    await client.query(schemaSql);
    logger.info('✅ Database schema created successfully (15 tables, enums, triggers, indexes).');

    // 2. Run 002_seed_data.sql
    const seedFile = join(__dirname, 'migrations', '002_seed_data.sql');
    logger.info(`Executing seed file: 002_seed_data.sql`);
    const seedSql = readFileSync(seedFile, 'utf-8');
    await client.query(seedSql);
    logger.info('✅ Demo seed data inserted successfully.');

    logger.info('================================================================');
    logger.info(' 🎉 CLASSCREW MIGRATION COMPLETE!');
    logger.info('================================================================');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`❌ Migration failed: ${message}`);
    logger.info('If using Supabase, you can also paste server/src/database/migrations/001_initial_schema.sql directly into the Supabase Dashboard SQL Editor.');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
