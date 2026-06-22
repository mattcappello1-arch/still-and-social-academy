/**
 * Still & Social Academy - Database Migration Script
 *
 * Runs the schema SQL against the Supabase database using the Management API.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=your_pat node scripts/migrate.mjs
 *
 * If the Management API is not available, copy the contents of
 * supabase-schema.sql and paste them into the Supabase SQL Editor at:
 * https://supabase.com/dashboard/project/craxdxdldvoknszloeps/sql/new
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'craxdxdldvoknszloeps';

// Read the SQL file
const sql = readFileSync(join(__dirname, '..', 'supabase-schema.sql'), 'utf-8');

// Try Management API first (requires personal access token)
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.log('='.repeat(60));
  console.log('No SUPABASE_ACCESS_TOKEN found.');
  console.log('');
  console.log('Option 1: Set a Supabase Personal Access Token:');
  console.log('  SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/migrate.mjs');
  console.log('');
  console.log('  Get one at: https://supabase.com/dashboard/account/tokens');
  console.log('');
  console.log('Option 2: Paste the SQL manually in the Supabase SQL Editor:');
  console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('');
  console.log('  The SQL file is at: supabase-schema.sql');
  console.log('='.repeat(60));
  process.exit(1);
}

console.log('Running migration against Supabase project:', PROJECT_REF);
console.log('SQL length:', sql.length, 'characters');

try {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Migration failed with status:', response.status);
    console.error('Response:', errorText);
    process.exit(1);
  }

  const result = await response.json();
  console.log('Migration completed successfully!');
  console.log('Result:', JSON.stringify(result, null, 2).slice(0, 500));
} catch (error) {
  console.error('Migration error:', error.message);
  process.exit(1);
}
