/**
 * Runs only the location-related migrations (0005, 0006, 0007)
 * against the remote Supabase database.
 *
 * Migrations 0001–0004 were applied manually via SQL Editor so we
 * skip them. After applying 0005–0007 this script also records them
 * in the Supabase CLI migration history table so future `db push`
 * won't try to re-run them.
 *
 * Usage:
 *   node scripts/migrate-locations.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');

// Only the migrations that are NOT yet in the remote DB
const PENDING = [
  '202608160005_live_agent_location.sql',
  '202608160006_backfill_existing_task_locations.sql',
  '202608160007_complete_realtime_sync.sql',
];

// All 7 migrations – we'll register all of them in the history table
// so the CLI knows the remote is fully up to date.
const ALL_MIGRATIONS = [
  '202608160001_realtime_field_investigation.sql',
  '202608160002_auto_profile_trigger.sql',
  '202608160003_agent_phone_lookup.sql',
  '202608160004_agent_provisioning_integrity.sql',
  '202608160005_live_agent_location.sql',
  '202608160006_backfill_existing_task_locations.sql',
  '202608160007_complete_realtime_sync.sql',
];

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const DB_HOST = 'db.cqewqvvtzcqspsjspfzl.supabase.co';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter your Supabase Database Password: ', (password) => {
  rl.close();
  if (!password.trim()) { console.error('Password is required.'); process.exit(1); }
  run(password.trim());
});

async function run(password) {
  const client = new Client({
    host: DB_HOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('\n⏳  Connecting to Supabase…');
    await client.connect();
    console.log('✓  Connected');

    // 1. Apply the pending migrations
    for (const filename of PENDING) {
      const file = path.join(MIGRATIONS_DIR, filename);
      if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
      console.log(`\n→  Applying ${filename}…`);
      await client.query(fs.readFileSync(file, 'utf8'));
      console.log(`   ✓  Done`);
    }

    // 2. Ensure the CLI history schema exists
    await client.query(`
      create schema if not exists supabase_migrations;
      create table if not exists supabase_migrations.schema_migrations (
        version text not null primary key,
        statements text[],
        name text
      );
    `);

    // 3. Register ALL migrations in history (idempotent upsert)
    console.log('\n→  Registering migration history so CLI stays in sync…');
    for (const filename of ALL_MIGRATIONS) {
      const version = filename.replace(/^(\d+)_.*$/, '$1');
      await client.query(
        `insert into supabase_migrations.schema_migrations (version, name)
         values ($1, $2)
         on conflict (version) do nothing`,
        [version, filename],
      );
    }
    console.log('   ✓  Migration history updated');

    console.log('\n🎉  All location migrations applied successfully!');
    console.log('    create_task now accepts lat/lng — creating new cases should work.');
  } catch (err) {
    console.error('\n❌  Failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
