const fs = require('fs');
const path = require('path');

// 1. Read env variables
const envPath = '/home/vikram/Desktop/Vikram-Codes/zapin-itinerary/.env.local';
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Supabase URL or Anon key not found in .env.local');
  process.exit(1);
}

async function clean() {
  console.log(`Deleting old 'Itinero AI' itineraries from Supabase database at ${url}...`);
  try {
    const response = await fetch(`${url}/rest/v1/itineraries?author_name=eq.Itinero%20AI`, {
      method: 'DELETE',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`HTTP ${response.status}: ${txt}`);
    }

    console.log(`Success! All older 'Itinero AI' itineraries have been deleted from Supabase.`);
  } catch (error) {
    console.error('Failed to delete old itineraries:', error.message);
    process.exit(1);
  }
}

clean();
