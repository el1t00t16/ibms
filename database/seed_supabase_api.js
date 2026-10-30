/**
 * IBMS Malungon: Supabase Direct Batch Seeder
 * Reads JSON seed files from database/seeds/ and upserts into Supabase in chunks.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key missing in .env');
  process.exit(1);
}

const isServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log(`🔌 Connecting to Supabase: ${supabaseUrl}`);
console.log(`🔑 Key Role: ${isServiceRole ? 'service_role (Admin - Bypasses RLS)' : 'anon (Public - Requires RLS Policy)'}\n`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const seedsDir = path.resolve(__dirname, 'seeds');

async function seedTable(tableName, jsonFileName, conflictCol = null, batchSize = 250) {
  const filePath = path.join(seedsDir, jsonFileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Seed file ${jsonFileName} not found. Skipping.`);
    return true;
  }

  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const total = items.length;
  console.log(`📦 Seeding "${tableName}": ${total} records...`);

  if (!conflictCol) {
    // For tables without unique conflict key (e.g. payroll), wipe before batch insert
    await supabase.from(tableName).delete().neq('no', -999999);
  }

  let inserted = 0;
  for (let i = 0; i < total; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    let query = supabase.from(tableName);

    let res;
    if (conflictCol) {
      res = await query.upsert(chunk, { onConflict: conflictCol });
    } else {
      res = await query.insert(chunk);
    }

    if (res.error) {
      console.error(`\n❌ Error seeding "${tableName}" at offset ${i}:`, res.error.message);
      if (res.error.code === '42501') {
        console.error('💡 Hint: Run "database/00_enable_anon_sync_policy.sql" in Supabase SQL Editor or provide SUPABASE_SERVICE_ROLE_KEY in .env.');
      }
      return false;
    }

    inserted += chunk.length;
    process.stdout.write(`\r   Progress: ${inserted}/${total} (${Math.round((inserted / total) * 100)}%)`);
  }

  console.log(`\n   ✅ Finished "${tableName}" (${inserted} records).\n`);
  return true;
}

async function run() {
  console.log('🚀 Starting IBMS Supabase Seeding Process...\n');

  // Clean any test artifact rows if present
  await supabase.from('scholars').delete().eq('control_no', 9999);
  await supabase.from('scholars').delete().eq('ibm_id', 'TEST-SCH-001');

  // 1. Semesters (11 records)
  const ok1 = await seedTable('semesters', 'semesters.json', 'semester_name', 50);
  if (!ok1) return;

  // 2. Scholars (2,374 records)
  const ok2 = await seedTable('scholars', 'scholars.json', 'ibm_id', 200);
  if (!ok2) return;

  // 3. Scholar Semesters (13,898 records)
  const ok3 = await seedTable('scholar_semesters', 'scholar_semesters.json', 'ibm_id,semester_name', 500);
  if (!ok3) return;

  // 4. Payroll (300 records)
  const ok4 = await seedTable('payroll', 'payroll.json', null, 200);
  if (!ok4) return;

  // 5. Graduates (2,136 records)
  const ok5 = await seedTable('graduates', 'graduates.json', 'ibm_id', 300);
  if (!ok5) return;

  console.log('🎉 Seeding successfully completed for all tables!');
}

run();
