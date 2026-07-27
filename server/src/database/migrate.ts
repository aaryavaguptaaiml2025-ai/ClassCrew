import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  logger.info('Starting database migrations...');

  const migrationFile = join(__dirname, 'migrations', '001_initial_schema.sql');
  const sql = readFileSync(migrationFile, 'utf-8');

  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
      if (error) {
        logger.warn(`Migration statement warning: ${error.message}`);
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      logger.error(`Migration statement failed: ${err}`);
      errorCount++;
    }
  }

  logger.info(`Migration complete. Success: ${successCount}, Errors: ${errorCount}`);
  logger.info('You can also run the SQL directly in the Supabase SQL Editor for best results.');
}

runMigrations().catch((err) => {
  logger.error('Migration failed:', err);
  process.exit(1);
});
