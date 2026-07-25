const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('FATAL: SUPABASE_URL and SUPABASE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  console.log('Connecting to Supabase...');
  // Quick health check — try reading from a table
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
    // PGRST116 = "No rows found" — that's fine
    console.log('Supabase connection test note:', error.message);
  }
  console.log('Supabase client initialized successfully.');
}

function getMode() {
  return 'supabase';
}

function getClient() {
  return supabase;
}

module.exports = {
  initializeDatabase,
  getMode,
  getClient,
  supabase
};
