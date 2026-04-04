/**
 * Bulk insert UAE merchants across all 17 spending categories.
 * Run: node scripts/bulk_insert_merchants.js
 * Uses service role key to bypass RLS.
 * Skips merchants that already exist (case-insensitive name match).
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

// Category IDs from the DB
const CAT = {
  dining:          'b7938d64-7ff6-4f84-9b0d-c35010e5fa58',
  groceries:       '124036e7-401b-4f26-bf83-6662fd0b0cf4',
  fuel:            'f933e7ed-2b6e-4eef-9f6b-ff551b8774cf',
  airlines:        'c418c3e6-9403-4ce6-8647-ed52782a59eb',
  shopping:        '5212cc11-77de-432c-8340-994f35e03d1b',
  hotels:          'f990d8af-9955-4b22-881c-4cf4de2cbe3e',
  travel:          '592dad17-981b-4af8-8095-596507f0b780',
  online_shopping: '8e3f1bc5-f519-4f2a-82b9-cefa8ebfda86',
  entertainment:   'dd8d714c-1e5a-4db5-91d4-fba3756ed77c',
  utilities:       '450b6bb4-60ba-4083-aa24-1609bb2f6bcf',
  education:       '4da65213-5c02-4f63-9c5f-5c09c3b9c745',
  insurance:       'e6a697a6-e73d-4464-a3bd-e8aa2722c8cf',
  government:      'e0ea45f3-cc1a-4c99-b30a-18c373412eda',
  rent:            'f8aa1118-e895-4aea-be6a-98a86fdf40f8',
  healthcare:      'a9aad3fe-9afa-4c12-957f-153994b5e501',
  general:         '8a0dbdfb-1214-4886-9ed2-30ee47d2fd7f',
};

// [name, category_slug, is_online, is_popular, aliases[]]
const MERCHANTS = [
  // ── DINING ────────────────────────────────────────────────────────────────
  ['McDonald\'s',          'dining', false, true,  ['McDonalds', 'Maccas']],
  ['KFC',                  'dining', false, true,  ['Kentucky Fried Chicken']],
  ['Burger King',          'dining', false, true,  []],
  ['Pizza Hut',            'dining', false, true,  []],
  ['Domino\'s',            'dining', false, true,  ['Dominos Pizza']],
  ['Starbucks',            'dining', false, true,  []],
  ['Costa Coffee',         'dining', false, true,  []],
  ['Tim Hortons',          'dining', false, true,  ['Tim Horton\'s']],
  ['Shake Shack',          'dining', false, true,  []],
  ['Nando\'s',             'dining', false, true,  ['Nandos']],
  ['Papa John\'s',         'dining', false, false, ['Papa Johns']],
  ['Subway',               'dining', false, true,  []],
  ['Five Guys',            'dining', false, false, []],
  ['Krispy Kreme',         'dining', false, true,  []],
  ['Dunkin\'',             'dining', false, true,  ['Dunkin Donuts', 'Dunkin\' Donuts']],
  ['Hardee\'s',            'dining', false, false, ['Hardees', 'Carl\'s Jr']],
  ['Applebee\'s',          'dining', false, false, ['Applebees']],
  ['TGI Fridays',          'dining', false, false, ['TGI Friday\'s']],
  ['The Cheesecake Factory','dining',false, false, ['Cheesecake Factory']],
  ['PF Chang\'s',          'dining', false, false, ['PF Changs']],
  ['Raising Cane\'s',      'dining', false, false, ['Raising Canes']],
  ['Kcal',                 'dining', false, false, []],
  ['Salt',                 'dining', false, false, []],
  ['Social House',         'dining', false, false, []],
  ['Baskin-Robbins',       'dining', false, false, ['Baskin Robbins']],
  ['Cold Stone Creamery',  'dining', false, false, []],
  ['Caribou Coffee',       'dining', false, false, []],
  ['Paul',                 'dining', false, false, ['Paul Bakery']],
  ['Crepaway',             'dining', false, false, []],
  ['Johnny Rockets',       'dining', false, false, []],
  ['Texas Roadhouse',      'dining', false, false, []],
  ['Applebee\'s',          'dining', false, false, []],
  ['Cheesesteak',          'dining', false, false, []],
  ['Japengo',              'dining', false, false, []],
  ['Trattoria',            'dining', false, false, []],
  ['Sushi Counter',        'dining', false, false, []],
  ['Zaatar w Zeit',        'dining', false, false, ['Zaatar w Zeit']],
  ['Barasti',              'dining', false, false, []],

  // ── GROCERIES ────────────────────────────────────────────────────────────
  ['Al Maya',              'groceries', false, true,  ['Al Maya Supermarket']],
  ['West Zone Fresh',      'groceries', false, false, ['West Zone']],
  ['Waitrose',             'groceries', false, true,  []],
  ['Organic Foods & Café', 'groceries', false, false, ['Organic Foods']],
  ['InstaShop',            'groceries', true,  true,  []],
  ['Viva Supermarket',     'groceries', false, false, []],
  ['Earth Supermarket',    'groceries', false, false, []],
  ['Géant Express',        'groceries', false, false, ['Geant Express']],
  ['Zoom',                 'groceries', false, false, ['Zoom Supermarket']],
  ['Nesto',                'groceries', false, false, ['Nesto Hypermarket']],
  ['Day to Day',           'groceries', false, false, []],
  ['Spar',                 'groceries', false, false, ['Spar UAE']],

  // ── FUEL ─────────────────────────────────────────────────────────────────
  ['CAFU',                 'fuel', false, false, ['CAFU Fuel Delivery']],
  ['EPPCO',                'fuel', false, false, []],

  // ── AIRLINES ─────────────────────────────────────────────────────────────
  ['Qatar Airways',        'airlines', false, true,  []],
  ['Turkish Airlines',     'airlines', false, true,  []],
  ['British Airways',      'airlines', false, true,  []],
  ['Lufthansa',            'airlines', false, false, []],
  ['Air India',            'airlines', false, true,  []],
  ['IndiGo',               'airlines', false, true,  []],
  ['SpiceJet',             'airlines', false, false, []],
  ['Singapore Airlines',   'airlines', false, false, []],
  ['Gulf Air',             'airlines', false, false, []],
  ['Oman Air',             'airlines', false, false, []],
  ['SriLankan Airlines',   'airlines', false, false, []],
  ['Ethiopian Airlines',   'airlines', false, false, []],
  ['Kenya Airways',        'airlines', false, false, []],
  ['WizzAir Abu Dhabi',    'airlines', false, false, ['WizzAir']],

  // ── SHOPPING ─────────────────────────────────────────────────────────────
  ['Marks & Spencer',      'shopping', false, true,  ['M&S', 'Marks and Spencer']],
  ['Gap',                  'shopping', false, false, []],
  ['Banana Republic',      'shopping', false, false, []],
  ['Harvey Nichols',       'shopping', false, false, []],
  ['Bloomingdale\'s',      'shopping', false, false, ['Bloomingdales']],
  ['Saks Fifth Avenue',    'shopping', false, false, ['Saks 5th Avenue']],
  ['Level Shoes',          'shopping', false, false, []],
  ['Damas Jewellery',      'shopping', false, false, ['Damas']],
  ['Malabar Gold',         'shopping', false, false, ['Malabar Gold & Diamonds']],
  ['Paris Gallery',        'shopping', false, false, []],
  ['Stradivarius',         'shopping', false, false, []],
  ['Pull & Bear',          'shopping', false, false, ['Pull and Bear']],
  ['Bershka',              'shopping', false, false, []],
  ['Massimo Dutti',        'shopping', false, false, []],
  ['Pottery Barn',         'shopping', false, false, []],
  ['Crate & Barrel',       'shopping', false, false, ['Crate and Barrel']],
  ['Pan Emirates',         'shopping', false, false, ['Pan Emirates Furniture']],
  ['Dragon Mart',          'shopping', false, false, []],
  ['Puma',                 'shopping', false, false, []],
  ['New Balance',          'shopping', false, false, []],
  ['Under Armour',         'shopping', false, false, []],
  ['Jack & Jones',         'shopping', false, false, ['Jack and Jones']],
  ['Mango',                'shopping', false, true,  []],
  ['Mothercare',           'shopping', false, false, []],
  ['Emax',                 'shopping', false, false, ['Emax Electronics']],
  ['Carrefour Electronics','shopping', false, false, []],
  ['The Giving Movement',  'shopping', false, false, []],
  ['Rivoli',               'shopping', false, false, ['Rivoli Group']],
  ['THAT Concept Store',   'shopping', false, false, ['THAT']],
  ['Mexx',                 'shopping', false, false, []],
  ['Reiss',                'shopping', false, false, []],
  ['Ted Baker',            'shopping', false, false, []],
  ['Tommy Hilfiger',       'shopping', false, false, []],
  ['Calvin Klein',         'shopping', false, false, []],
  ['Forever 21',           'shopping', false, false, []],
  ['Sephora',              'shopping', false, true,  []],
  ['MAC Cosmetics',        'shopping', false, false, ['MAC']],
  ['L\'Occitane',          'shopping', false, false, ['LOccitane', 'L Occitane']],
  ['Bath & Body Works',    'shopping', false, false, ['Bath and Body Works']],
  ['Victoria\'s Secret',   'shopping', false, false, ['Victorias Secret']],
  ['Pandora',              'shopping', false, false, []],
  ['Tanagra',              'shopping', false, false, []],
  ['Ahmed Seddiqi',        'shopping', false, false, ['Seddiqi & Sons']],
  ['Landmark',             'shopping', false, false, ['Landmark Group']],

  // ── HOTELS ───────────────────────────────────────────────────────────────
  ['Hyatt',                'hotels', false, true,  ['Grand Hyatt', 'Park Hyatt', 'Andaz']],
  ['Four Seasons',         'hotels', false, false, []],
  ['Waldorf Astoria',      'hotels', false, false, []],
  ['Ritz-Carlton',         'hotels', false, false, ['The Ritz-Carlton']],
  ['Address Hotels',       'hotels', false, false, ['Address Downtown', 'Address Hotel']],
  ['Atlantis',             'hotels', false, false, ['Atlantis The Palm', 'Atlantis The Royal']],
  ['Bulgari Hotel',        'hotels', false, false, ['Bvlgari Hotel']],
  ['Armani Hotel',         'hotels', false, false, []],
  ['W Hotels',             'hotels', false, false, ['W Dubai', 'W Abu Dhabi']],
  ['Sheraton',             'hotels', false, false, []],
  ['Westin',               'hotels', false, false, ['The Westin']],
  ['St. Regis',            'hotels', false, false, ['St Regis']],
  ['Le Meridien',          'hotels', false, false, ['Le Méridien']],
  ['Anantara',             'hotels', false, false, []],
  ['One&Only',             'hotels', false, false, ['One and Only']],
  ['Kempinski',            'hotels', false, false, []],
  ['Sofitel',              'hotels', false, false, []],
  ['Novotel',              'hotels', false, false, []],
  ['ibis',                 'hotels', false, false, ['Ibis Hotel']],
  ['Radisson',             'hotels', false, false, ['Radisson Blu', 'Radisson Red']],
  ['Wyndham',              'hotels', false, false, []],
  ['InterContinental',     'hotels', false, false, ['IHG InterContinental']],
  ['Crowne Plaza',         'hotels', false, false, []],
  ['Holiday Inn',          'hotels', false, false, []],
  ['Premier Inn',          'hotels', false, false, []],
  ['Palazzo Versace',      'hotels', false, false, []],
  ['Nikki Beach',          'hotels', false, false, []],
  ['FIVE Hotels',          'hotels', false, false, ['FIVE Palm', 'FIVE Jumeirah']],

  // ── OTHER TRAVEL ─────────────────────────────────────────────────────────
  ['Airbnb',               'travel', true,  true,  []],
  ['Careem',               'travel', false, true,  ['Careem Ride']],
  ['Uber',                 'travel', false, true,  []],
  ['Hertz',                'travel', false, false, ['Hertz Car Rental']],
  ['Europcar',             'travel', false, false, []],
  ['Budget',               'travel', false, false, ['Budget Car Rental']],
  ['Avis',                 'travel', false, false, ['Avis Car Rental']],
  ['Sixt',                 'travel', false, false, []],
  ['MakeMyTrip',           'travel', true,  true,  []],
  ['Cleartrip',            'travel', true,  true,  []],
  ['Musafir',              'travel', true,  false, []],
  ['Almosafer',            'travel', true,  false, []],
  ['Wego',                 'travel', true,  false, []],
  ['Emirates Holidays',    'travel', true,  false, []],
  ['dnata Travel',         'travel', false, false, ['dnata']],
  ['Thomas Cook',          'travel', false, false, []],
  ['Expedia',              'travel', true,  false, []],
  ['Hala Taxi',            'travel', false, false, ['Hala by Careem']],
  ['Careem Bus',           'travel', false, false, []],
  ['RTA Taxi',             'travel', false, false, ['Dubai Taxi', 'RTA Smart Taxi']],

  // ── ONLINE SHOPPING ──────────────────────────────────────────────────────
  ['Shein',                'online_shopping', true,  true,  []],
  ['AliExpress',           'online_shopping', true,  true,  []],
  ['ASOS',                 'online_shopping', true,  false, []],
  ['Farfetch',             'online_shopping', true,  false, []],
  ['Centrepoint Online',   'online_shopping', true,  false, []],
  ['6thStreet',            'online_shopping', true,  false, ['6th Street']],
  ['NakedApe',             'online_shopping', true,  false, []],
  ['Sivvi',                'online_shopping', true,  false, []],
  ['Brands for Less',      'online_shopping', false, false, []],
  ['Carrefour Online',     'online_shopping', true,  false, []],
  ['Noon Daily',           'online_shopping', true,  false, []],
  ['iHerb',                'online_shopping', true,  false, []],

  // ── ENTERTAINMENT ────────────────────────────────────────────────────────
  ['IMG Worlds of Adventure','entertainment', false, true,  ['IMG Worlds']],
  ['Ski Dubai',            'entertainment', false, true,  []],
  ['Global Village',       'entertainment', false, true,  []],
  ['Dubai Frame',          'entertainment', false, false, []],
  ['Burj Khalifa',         'entertainment', false, false, ['At the Top', 'Burj Khalifa Ticket']],
  ['Aquaventure',          'entertainment', false, false, ['Aquaventure Waterpark']],
  ['Laguna Waterpark',     'entertainment', false, false, []],
  ['Motiongate',           'entertainment', false, false, ['Motiongate Dubai']],
  ['Ferrari World',        'entertainment', false, false, ['Ferrari World Abu Dhabi']],
  ['Warner Bros. World',   'entertainment', false, false, ['Warner Bros World']],
  ['Yas Waterworld',       'entertainment', false, false, []],
  ['Dubai Garden Glow',    'entertainment', false, false, []],
  ['Museum of the Future', 'entertainment', false, false, []],
  ['Dubai Opera',          'entertainment', false, false, []],
  ['Platinum Cinemas',     'entertainment', false, false, []],
  ['Cineco',               'entertainment', false, false, []],
  ['Netflix',              'entertainment', true,  true,  []],
  ['Spotify',              'entertainment', true,  true,  []],
  ['OSN+',                 'entertainment', true,  false, ['OSN', 'OSN Streaming']],
  ['beIN Sports',          'entertainment', true,  false, ['beIN Connect']],
  ['SharafDG',             'entertainment', false, false, []],
  ['Playnation',           'entertainment', false, false, []],
  ['Bounce Dubai',         'entertainment', false, false, ['Bounce']],
  ['XDubai',               'entertainment', false, false, []],
  ['Dubai Aquarium',       'entertainment', false, false, ['Dubai Aquarium & Underwater Zoo']],

  // ── UTILITIES ────────────────────────────────────────────────────────────
  ['SEWA',                 'utilities', false, false, ['Sharjah Electricity and Water']],
  ['FEWA',                 'utilities', false, false, ['Federal Electricity and Water']],
  ['ADDC',                 'utilities', false, false, ['Abu Dhabi Distribution Company']],
  ['AADC',                 'utilities', false, false, ['Al Ain Distribution Company']],
  ['Etihad Water & Electricity','utilities', false, false, ['EWE']],
  ['Virgin Mobile UAE',    'utilities', false, false, ['Virgin Mobile']],
  ['Careem Pay',           'utilities', false, false, []],
  ['Smiles',               'utilities', false, false, ['Smiles Etisalat']],

  // ── EDUCATION ────────────────────────────────────────────────────────────
  ['Aldar Academies',      'education', false, false, ['Aldar Education']],
  ['Innoventures Education','education', false, false, []],
  ['Bloom Education',      'education', false, false, []],
  ['Fortes Education',     'education', false, false, []],
  ['Archway Learning Trust','education', false, false, []],
  ['Courserino',           'education', true,  false, []],
  ['Udemy',                'education', true,  false, []],
  ['Coursera',             'education', true,  false, []],
  ['Duolingo',             'education', true,  false, []],
  ['British Council',      'education', false, false, []],
  ['IELTS',                'education', false, false, []],

  // ── INSURANCE ─────────────────────────────────────────────────────────────
  ['Orient Insurance',     'insurance', false, false, ['Oman Insurance']],
  ['GIG Insurance',        'insurance', false, false, ['AXA Insurance UAE', 'AXA Gulf']],
  ['RSA Insurance',        'insurance', false, false, []],
  ['MetLife',              'insurance', false, false, []],
  ['Sukoon Insurance',     'insurance', false, false, []],
  ['ADNIC',                'insurance', false, false, ['Abu Dhabi National Insurance']],
  ['National General Insurance','insurance', false, false, ['NGI']],
  ['Noor Takaful',         'insurance', false, false, []],
  ['Watania Takaful',      'insurance', false, false, []],
  ['Zurich Insurance',     'insurance', false, false, []],
  ['Cigna',                'insurance', false, false, []],
  ['Daman',                'insurance', false, false, ['Daman Health']],
  ['Allianz',              'insurance', false, false, []],
  ['Dubai Insurance',      'insurance', false, false, []],

  // ── GOVERNMENT ───────────────────────────────────────────────────────────
  ['RTA',                  'government', false, true,  ['Roads and Transport Authority']],
  ['ICA',                  'government', false, false, ['Federal Authority for Identity']],
  ['DLD',                  'government', false, false, ['Dubai Land Department']],
  ['AMER',                 'government', false, false, []],
  ['TAMM',                 'government', false, false, []],
  ['Dubai Municipality',   'government', false, false, []],
  ['Dubai Courts',         'government', false, false, []],
  ['MOI UAE',              'government', false, false, ['Ministry of Interior UAE']],
  ['Dubai Police',         'government', false, false, []],
  ['Abu Dhabi Police',     'government', false, false, []],
  ['MOHRE',                'government', false, false, ['Ministry of Human Resources']],
  ['GDRFA',                'government', false, false, ['General Directorate of Residency']],
  ['ADJD',                 'government', false, false, ['Abu Dhabi Judicial Department']],
  ['Invest in Dubai',      'government', false, false, []],
  ['Dubai Economic Dept',  'government', false, false, ['DED Dubai']],

  // ── RENT ─────────────────────────────────────────────────────────────────
  ['Ejari',                'rent', false, true,  []],
  ['Bayut',                'rent', true,  false, []],
  ['Property Finder',      'rent', true,  false, []],
  ['Dubizzle',             'rent', true,  false, []],
  ['Espace Real Estate',   'rent', false, false, []],
  ['Betterhomes',          'rent', false, false, []],

  // ── HEALTHCARE ───────────────────────────────────────────────────────────
  ['Cleveland Clinic Abu Dhabi','healthcare', false, false, ['Cleveland Clinic']],
  ['American Hospital Dubai','healthcare', false, false, ['American Hospital']],
  ['King\'s College Hospital','healthcare', false, false, ['King\'s College', 'KCH Dubai']],
  ['Rashid Hospital',      'healthcare', false, false, []],
  ['Dubai Hospital',       'healthcare', false, false, []],
  ['Al Zahra Hospital',    'healthcare', false, false, []],
  ['Thumbay Hospital',     'healthcare', false, false, []],
  ['Burjeel Hospital',     'healthcare', false, false, []],
  ['Zulekha Hospital',     'healthcare', false, false, []],
  ['Canadian Specialist Hospital','healthcare', false, false, []],
  ['Life Pharmacy',        'healthcare', false, true,  []],
  ['Boots Pharmacy',       'healthcare', false, false, ['Boots']],
  ['Bin Sina Pharmacy',    'healthcare', false, false, ['Bin Sina']],
  ['Aster Pharmacy',       'healthcare', false, false, []],
  ['United Pharmacy',      'healthcare', false, false, []],
  ['MMI Pharmacy',         'healthcare', false, false, []],
  ['Baqer Mohebi Pharmacy','healthcare', false, false, []],
  ['Aster Clinic',         'healthcare', false, false, []],
  ['iCARE Clinics',        'healthcare', false, false, ['iCARE']],
  ['Medcare Hospitals',    'healthcare', false, false, ['Medcare']],
  ['Prime Medical Center', 'healthcare', false, false, []],
  ['ProDerma',             'healthcare', false, false, []],
  ['Emirates Hospital',    'healthcare', false, false, []],

  // ── GENERAL ──────────────────────────────────────────────────────────────
  ['Fitness First',        'general', false, false, []],
  ['Anytime Fitness',      'general', false, false, []],
  ['PureGym',              'general', false, false, []],
  ['GymNation',            'general', false, false, []],
  ['Gold\'s Gym',          'general', false, false, ['Golds Gym']],
  ['Talabat Mart',         'general', false, false, []],
  ['Noon Minutes',         'general', false, false, []],
  ['InstaShop Express',    'general', false, false, []],
  ['IKEA Food',            'general', false, false, []],
];

async function main() {
  // Fetch existing merchant names (lowercased) for dedup
  const { data: existing } = await supabase
    .from('merchants')
    .select('name');

  const existingNames = new Set((existing ?? []).map(m => m.name.toLowerCase()));
  console.log(`Existing merchants: ${existingNames.size}`);

  // Deduplicate within our list too (by name)
  const seen = new Set();
  const toInsert = [];

  for (const [name, slug, is_online, is_popular, aliases] of MERCHANTS) {
    const key = name.toLowerCase();
    if (existingNames.has(key) || seen.has(key)) {
      console.log(`  SKIP (exists): ${name}`);
      continue;
    }
    seen.add(key);

    const category_id = CAT[slug];
    if (!category_id) {
      console.warn(`  WARN: unknown category slug "${slug}" for ${name}`);
      continue;
    }

    toInsert.push({
      name,
      category_id,
      is_online,
      is_popular,
      aliases: aliases.length > 0 ? aliases : null,
      logo_url: null,
      sort_order: 999,
    });
  }

  console.log(`\nInserting ${toInsert.length} new merchants…`);

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from('merchants').insert(batch);
    if (error) {
      console.error(`  ERROR inserting batch ${i}–${i + batch.length}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`  Inserted batch ${Math.floor(i / BATCH) + 1} (${batch.length} rows)`);
    }
  }

  console.log(`\nDone. Inserted ${inserted} merchants.`);

  // Final count
  const { count } = await supabase
    .from('merchants')
    .select('*', { count: 'exact', head: true });
  console.log(`Total merchants in DB: ${count}`);
}

main().catch(console.error);
