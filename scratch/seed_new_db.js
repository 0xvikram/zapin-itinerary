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

// 2. New AI Data to insert
const newItineraries = [
  {
    user_id: "ai-planner",
    author_name: "Roam AI",
    author_image: "",
    title: "Tokyo & Kyoto Discovery: Shrines & Neon Lights",
    location: "Tokyo & Kyoto, Japan",
    duration_days: 6,
    budget: "Mid-range",
    description: "Experience the contrast between future and past. Explore Shibuya and Akihabara in Tokyo, then take the Bullet Train to Kyoto for historical bamboo forests and temples.",
    content: {
      days: [
        {
          day: 1,
          title: "Tokyo High-Tech & Views",
          activities: [
            { time: "10:00", activity: "Shibuya Sky Observatory", notes: "Book tickets online for sunset slot. Unbelievable 360 views.", mapLink: "https://maps.google.com/?q=Shibuya+Sky" },
            { time: "14:00", activity: "Akihabara Electric Town", notes: "Explore anime shops, retro gaming, and maid cafes.", mapLink: "https://maps.google.com/?q=Akihabara" }
          ]
        },
        {
          day: 2,
          title: "Kyoto Historic Shrines",
          activities: [
            { time: "07:30", activity: "Fushimi Inari Shrine walking", notes: "Walk through the thousands of vermilion torii gates. Beat the crowds by arriving early.", mapLink: "https://maps.google.com/?q=Fushimi+Inari+Taisha" },
            { time: "13:00", activity: "Kinkaku-ji (Golden Pavilion)", notes: "Breathtaking Zen temple covered in gold leaf reflecting on the pond.", mapLink: "https://maps.google.com/?q=Kinkaku-ji" }
          ]
        }
      ]
    }
  },
  {
    user_id: "ai-planner",
    author_name: "Roam AI",
    author_image: "",
    title: "Kerala Backwaters & Tea Gardens Escape",
    location: "Munnar & Alleppey, Kerala, India",
    duration_days: 4,
    budget: "Mid-range",
    description: "Relax in 'God's Own Country'. Tour the rolling tea plantations in Munnar and cruise the serene, palm-fringed backwaters of Alleppey on a traditional houseboat.",
    content: {
      days: [
        {
          day: 1,
          title: "Munnar Tea Estates & Waterfalls",
          activities: [
            { time: "09:00", activity: "Kolukkumalai Tea Estate Jeep Safari", notes: "World's highest tea estate. Absolutely stunning vistas.", mapLink: "https://maps.google.com/?q=Kolukkumalai+Tea+Estate" },
            { time: "14:00", activity: "Attukad Waterfalls trek", notes: "Scenic waterfall surrounded by hills and dense forests.", mapLink: "https://maps.google.com/?q=Attukad+Waterfalls" }
          ]
        },
        {
          day: 2,
          title: "Alleppey Houseboat Cruise",
          activities: [
            { time: "12:00", activity: "Board Houseboat at Alleppey", notes: "Cruise through the Vembanad lake. Traditional Kerala lunch served on board.", mapLink: "https://maps.google.com/?q=Alappuzha+Houseboats" }
          ]
        }
      ]
    }
  },
  {
    user_id: "ai-planner",
    author_name: "Roam AI",
    author_image: "",
    title: "New York City Classic Landmarks & Vibe",
    location: "New York City, New York, USA",
    duration_days: 4,
    budget: "Mid-range",
    description: "Experience the ultimate Big Apple trip. Walk across the Brooklyn Bridge, tour the skyscrapers of Midtown Manhattan, and relax in Central Park.",
    content: {
      days: [
        {
          day: 1,
          title: "Midtown Skyscrapers & Times Square",
          activities: [
            { time: "09:00 AM", activity: "Empire State Building Observatory", notes: "Go early to catch clear views of Manhattan.", mapLink: "https://maps.google.com/?q=Empire+State+Building" },
            { time: "01:00 PM", activity: "Walk through Times Square & Broadway", notes: "Incredible energy, perfect for pictures.", mapLink: "https://maps.google.com/?q=Times+Square" }
          ]
        },
        {
          day: 2,
          title: "Central Park & Museums",
          activities: [
            { time: "10:00 AM", activity: "The Metropolitan Museum of Art (The Met)", notes: "Spend a few hours exploring the historical collections.", mapLink: "https://maps.google.com/?q=The+Metropolitan+Museum+of+Art" },
            { time: "02:30 PM", activity: "Central Park Row Boats", notes: "Rent a classic rowboat at the Loeb Boathouse.", mapLink: "https://maps.google.com/?q=Central+Park" }
          ]
        }
      ]
    }
  },
  {
    user_id: "ai-planner",
    author_name: "Roam AI",
    author_image: "",
    title: "Bali Tropical Culture & Beach Loop",
    location: "Bali, Indonesia",
    duration_days: 5,
    budget: "Budget",
    description: "A gorgeous 5-day route through Ubud's temples, rice terraces, waterfall trails, and Seminyak sunset beaches.",
    content: {
      days: [
        {
          day: 1,
          title: "Ubud Culture & Sacred Forest",
          activities: [
            { time: "09:00 AM", activity: "Sacred Monkey Forest Sanctuary", notes: "Keep your belongings secure! Beautiful ancient temple paths.", mapLink: "https://maps.google.com/?q=Sacred+Monkey+Forest+Sanctuary" },
            { time: "02:00 PM", activity: "Tegallalang Rice Terraces walk", notes: "Stunning scenery, perfect swing spots.", mapLink: "https://maps.google.com/?q=Tegallalang+Rice+Terraces" }
          ]
        },
        {
          day: 2,
          title: "Waterfalls & Sunset Beach",
          activities: [
            { time: "10:00 AM", activity: "Tegenungan Waterfall trek", notes: "Enjoy the refreshing breeze and take photos near the pool.", mapLink: "https://maps.google.com/?q=Tegenungan+Waterfall" },
            { time: "05:00 PM", activity: "Seminyak Beach Sunset", notes: "Relax at a beach club with a coconut.", mapLink: "https://maps.google.com/?q=Seminyak+Beach" }
          ]
        }
      ]
    }
  }
];

// 3. Make REST Request
async function run() {
  console.log(`Seeding new AI itineraries into Supabase database at ${url}...`);
  try {
    const response = await fetch(`${url}/rest/v1/itineraries`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newItineraries)
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`HTTP ${response.status}: ${txt}`);
    }

    const data = await response.json();
    console.log(`Success! Inserted ${data.length} new AI itineraries into Supabase.`);
  } catch (error) {
    console.error('Failed to seed Supabase database:', error.message);
    process.exit(1);
  }
}

run();
