const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim()))
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // ── Card summary updates (move account-wide cap to cards.summary) ──────────
  const summaryUpdates = [
    {
      id: '01e72932-8a77-447a-86ca-6c7161290608', // Private
      summary: 'An invite-tier Majid Al Futtaim co-branded card earning 2% SHARE Points on general spend and 10% at MAF malls, Carrefour, and entertainment venues, with lounge access for cardholder plus two guests, for an AED 1,575 annual fee. Monthly earning cap: 200,000 SHARE Points (≈AED 20,000)/month across all categories. Verified on June 16, 2026.',
    },
    {
      id: '24a37507-e7e7-49e3-bc7e-fa331411df66', // Infinite
      summary: 'A premium Majid Al Futtaim co-branded card earning 1.5% SHARE Points on general spend and 8% at MAF malls, Carrefour, and entertainment venues, for an AED 1,575 annual fee. Monthly earning cap: 100,000 SHARE Points (≈AED 10,000)/month across all categories. Verified on June 15, 2026.',
    },
    {
      id: '9659dd8f-1fb9-4e00-bd39-897700eb1da1', // Signature
      summary: 'A free-for-life Majid Al Futtaim co-branded card earning 1% SHARE Points on general spend and 6% at MAF malls, Carrefour, and entertainment venues, with unlimited lounge access. Monthly earning cap: 50,000 SHARE Points (≈AED 5,000)/month across all categories. Verified on June 15, 2026.',
    },
    {
      id: '53578327-8f9c-49d1-902f-d45f9f2131d4', // Platinum
      summary: 'A free-for-life Majid Al Futtaim co-branded card earning 0.75% SHARE Points on general spend and 4% at MAF malls, Carrefour, and entertainment venues. Monthly earning cap: 25,000 SHARE Points (≈AED 2,500)/month across all categories. Verified on June 15, 2026.',
    },
  ];

  // ── card_rewards.notes updates ────────────────────────────────────────────
  // IDs set to null: general / airlines / insurance / rent / fuel / government / education
  // + travel for Infinite, Signature, Platinum
  const nullIds = [
    // general
    'd9baf86b-3cb1-443d-9c38-87b3df62d23b', // Private
    '6a73eb64-500e-4261-91c1-42a6a2f659ef', // Infinite
    'a4de760d-7c12-4cb9-80b7-2ccba5949bd5', // Signature
    '02998311-776c-454a-b4f5-0b338d6941b6', // Platinum
    // airlines
    '0b3a8480-c057-4c23-a4b6-73636c62d6bc', // Private
    '0cb2fde6-42b9-49d9-9b3a-0745a298f01b', // Infinite
    '041b550e-72bd-48a1-b630-0b7041e26623', // Signature
    '1560f300-a90f-4503-96a5-4ffde913a150', // Platinum
    // insurance
    '48da3301-68b1-40db-8c24-7b434930ab65', // Private
    '6eaee455-b990-4638-8e2e-b6daee47dae1', // Infinite
    '0dadf9d7-0281-4e04-b076-ceaccde8411a', // Signature
    '701a73e5-6ec4-408c-bb64-12ba8ff2a939', // Platinum
    // rent
    '3ff24ed3-ebf6-4a9b-9ca9-584cb389982f', // Private
    '607539d2-731a-4a1d-92d9-93bead250c38', // Infinite
    '9d8dffe7-d239-4f87-8b2c-06a914e3dfd9', // Signature
    '38ddf99f-3ccf-4508-a46d-6a3316677d1e', // Platinum
    // fuel
    '792c5a18-0bf4-4ac6-8bd1-c07cee69a757', // Private
    '30fd86ba-dfb2-4039-a7f3-dbdbc2741d08', // Infinite
    '3dd67aaa-3590-4dbd-ae31-c8f7f4f01b98', // Signature
    '7ec6545b-833b-4faf-8f73-0adab547f2c0', // Platinum
    // government
    'ce910505-85cb-4d19-a77a-061a714cc941', // Private
    '7c3a13a2-521a-4bc7-a781-5d9426f210f9', // Infinite
    '0768006e-d4ce-43b8-a69f-6d27e18d90ba', // Signature
    '87f3f1a6-36ef-423f-bf72-0fc2b0532d28', // Platinum
    // education
    'a2dc5292-f38e-4e32-b357-cd1aa8fe2758', // Private
    'da4050c5-18f8-45b0-97d0-7fffddbfd72a', // Infinite
    '786736ba-f1cc-4bcd-a4bb-b797c36df17a', // Signature
    '21b12f8a-53bb-4cc2-a4f5-5ac189b45e26', // Platinum
    // travel — Infinite, Signature, Platinum (Private has a tier-specific note)
    '65388c54-0b78-4778-8a5d-8fb0fdc78344', // Infinite
    '6e1f95ba-e022-4507-a773-71c4e0aef8b9', // Signature
    '2d0fd214-df6a-4085-a8d8-51e901ed447a', // Platinum
  ];

  // Notes shared across all 4 cards
  const HEALTHCARE_NOTE = '⚠️ Healthcare is not explicitly listed in the SHARE rate table — assumed to earn at the standard domestic rate.';
  const ONLINE_SHOPPING_NOTE = 'Amazon.ae, Noon, and other non-MAF online retailers earn the standard rate — no MAF/SHARE ecosystem bonus.';
  const UTILITIES_NOTE = '⚠️ Utility and telecom payments made via ENBD Online Banking earn 0 points — pay directly to the biller (DEWA, Etisalat, du, etc.) to earn points.';

  const specificUpdates = [
    // ── healthcare (same note, 4 cards) ─────────────────────────────────────
    { id: '38b05b1c-4fff-44f8-abdc-d251203d88bc', notes: HEALTHCARE_NOTE }, // Private
    { id: 'f40c4d0f-f12e-442f-ba69-55b043d26487', notes: HEALTHCARE_NOTE }, // Infinite
    { id: '45e07fd8-0c05-451d-ae4e-d8ad5c348523', notes: HEALTHCARE_NOTE }, // Signature
    { id: '704a50f7-9600-4ff1-897e-fa1157d0ac32', notes: HEALTHCARE_NOTE }, // Platinum

    // ── online_shopping (same note, 4 cards) ────────────────────────────────
    { id: '7fc8a40c-f874-4016-852a-e4f52c355065', notes: ONLINE_SHOPPING_NOTE }, // Private
    { id: '70155a64-c010-410e-947d-a977d1ec8335', notes: ONLINE_SHOPPING_NOTE }, // Infinite
    { id: 'bd110ef5-2744-4a9a-be55-d3d9b9a80b43', notes: ONLINE_SHOPPING_NOTE }, // Signature
    { id: 'fd7943a9-c136-4dc7-8760-e30fc1393f09', notes: ONLINE_SHOPPING_NOTE }, // Platinum

    // ── utilities (same note, 4 cards) ──────────────────────────────────────
    { id: '59c356e1-2808-41ad-a8c6-0d0f94354cda', notes: UTILITIES_NOTE }, // Private
    { id: '8370808c-ed81-4c17-977d-55e29a9b666d', notes: UTILITIES_NOTE }, // Infinite
    { id: '8e8cacc8-ad5d-4659-92ab-7c39b3e55c91', notes: UTILITIES_NOTE }, // Signature
    { id: 'e9744eb7-44e2-4c49-a359-b19fa5be5f2b', notes: UTILITIES_NOTE }, // Platinum

    // ── dining (tier-specific ecosystem rate) ───────────────────────────────
    { id: '01ffa42c-1eef-4a02-9fff-49140ac94d41', notes: '⚠️ Fast-food/quick-service restaurants earn the reduced rate. 🎁 Earns 10% at SHARE Hotel Dining partners (Kempinski, Sheraton, Pullman, and Aloft at Mall of the Emirates and Deira City Centres) and restaurants within MAF malls.' }, // Private
    { id: 'ed4d7def-b8ef-4e33-a394-71ddd2d2d0e7', notes: '⚠️ Fast-food/quick-service restaurants earn the reduced rate. 🎁 Earns 8% at SHARE Hotel Dining partners (Kempinski, Sheraton, Pullman, and Aloft at Mall of the Emirates and Deira City Centres) and restaurants within MAF malls.' }, // Infinite
    { id: '292e83fb-7341-46a1-b591-2fbb87c16e61', notes: '⚠️ Fast-food/quick-service restaurants earn the reduced rate. 🎁 Earns 6% at SHARE Hotel Dining partners (Kempinski, Sheraton, Pullman, and Aloft at Mall of the Emirates and Deira City Centres) and restaurants within MAF malls.' }, // Signature
    { id: 'fc21e820-19e0-4b73-8a5e-d2c816d539c0', notes: '⚠️ Fast-food/quick-service restaurants earn the reduced rate. 🎁 Earns 4% at SHARE Hotel Dining partners (Kempinski, Sheraton, Pullman, and Aloft at Mall of the Emirates and Deira City Centres) and restaurants within MAF malls.' }, // Platinum

    // ── shopping (tier-specific ecosystem rate) ─────────────────────────────
    { id: 'fef7a08f-3042-43c1-9ef1-53d3d69b3075', notes: '🎁 Earns 10% at MAF malls (Mall of the Emirates, City Centres, Distrikt, Matajer) and SHARE lifestyle brands (Crate & Barrel, CB2, LEGO, All Saints, Lululemon, and others).' }, // Private
    { id: '81048ee4-fd2f-447f-942e-ff003b4d7f75', notes: '🎁 Earns 8% at MAF malls (Mall of the Emirates, City Centres, Distrikt, Matajer) and SHARE lifestyle brands (Crate & Barrel, CB2, LEGO, All Saints, Lululemon, and others).' }, // Infinite
    { id: 'd1731688-8444-448e-acaf-ed495c37598b', notes: '🎁 Earns 6% at MAF malls (Mall of the Emirates, City Centres, Distrikt, Matajer) and SHARE lifestyle brands (Crate & Barrel, CB2, LEGO, All Saints, Lululemon, and others).' }, // Signature
    { id: '5be9ade9-917e-49d3-a307-f53db77c3bd3', notes: '🎁 Earns 4% at MAF malls (Mall of the Emirates, City Centres, Distrikt, Matajer) and SHARE lifestyle brands (Crate & Barrel, CB2, LEGO, All Saints, Lululemon, and others).' }, // Platinum

    // ── entertainment (tier-specific ecosystem rate) ─────────────────────────
    { id: '5ae84153-4d38-44dc-a967-c69e88898305', notes: '🎁 Earns 10% at SHARE entertainment partners (Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, Little Explorers, Activate, iFly).' }, // Private
    { id: '931cdbf3-508a-4f8c-af8f-3a07acf15923', notes: '🎁 Earns 8% at SHARE entertainment partners (Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, Little Explorers, Activate, iFly).' }, // Infinite
    { id: '054b8133-7537-44ef-8ca7-c042c6122fa1', notes: '🎁 Earns 6% at SHARE entertainment partners (Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, Little Explorers, Activate, iFly).' }, // Signature
    { id: 'f920c104-0a59-41fe-983d-53479cf66eeb', notes: '🎁 Earns 4% at SHARE entertainment partners (Vox Cinemas, Ski Dubai, Snow Abu Dhabi, Magic Planet, Little Explorers, Activate, iFly).' }, // Platinum

    // ── groceries (reduced bucket; tier-specific Carrefour bonus) ────────────
    { id: 'a85df585-e003-43b4-836d-96e700a5eff5', notes: '⚠️ Non-Carrefour groceries earn the reduced rate. 🎁 Earns 10% at Carrefour and Carrefour Market.' }, // Private
    { id: '1fabdf6e-95d0-4d72-b29f-11d3614f5241', notes: '⚠️ Non-Carrefour groceries earn the reduced rate. 🎁 Earns 8% at Carrefour and Carrefour Market.' }, // Infinite
    { id: 'e567da59-9e4a-4082-99e0-2807f05824b8', notes: '⚠️ Non-Carrefour groceries earn the reduced rate. 🎁 Earns 6% at Carrefour and Carrefour Market.' }, // Signature
    { id: '1dbc2d28-a0cc-4492-a461-152e53838f45', notes: '⚠️ Non-Carrefour groceries earn the reduced rate. 🎁 Earns 4% at Carrefour and Carrefour Market.' }, // Platinum

    // ── international (EU/UK reduced rate varies per tier) ──────────────────
    { id: '0b21265c-4949-4f98-adb4-76ee588cb87f', notes: '⚠️ EU and UK spend earns 0.5% (reduced rate) instead of the standard 2%. Foreign-currency fee of 1.99% applies on all non-AED transactions.' }, // Private
    { id: '13701ae3-c182-4a73-8b38-8388be6eb00d', notes: '⚠️ EU and UK spend earns 0.375% (reduced rate) instead of the standard 1.5%. Foreign-currency fee of 1.99% applies on all non-AED transactions.' }, // Infinite
    { id: 'bf11765f-654f-4a74-9eb7-e4442cfd5429', notes: '⚠️ EU and UK spend earns 0.25% (reduced rate) instead of the standard 1%. Foreign-currency fee of 1.99% applies on all non-AED transactions.' }, // Signature
    { id: '9a46c407-52bd-4a9d-a5df-354f02a106b7', notes: '⚠️ EU and UK spend earns 0.19% (reduced rate) instead of the standard 0.75%. Foreign-currency fee of 1.99% applies on all non-AED transactions.' }, // Platinum

    // ── hotels (room vs hotel-dining distinction; tier-specific rate) ────────
    { id: '63a9e55e-c95e-4e84-b11d-626ec773f848', notes: '⚠️ Hotel room bookings earn the standard rate. Hotel dining at Kempinski, Sheraton, Pullman, and Aloft (Mall of the Emirates and Deira City Centres) earns 10% — see dining category.' }, // Private
    { id: '69426ec0-7ea9-426c-b803-21f83061f953', notes: '⚠️ Hotel room bookings earn the standard rate. Hotel dining at Kempinski, Sheraton, Pullman, and Aloft (Mall of the Emirates and Deira City Centres) earns 8% — see dining category.' }, // Infinite
    { id: '55486acd-61e0-4b77-b768-921e95135708', notes: '⚠️ Hotel room bookings earn the standard rate. Hotel dining at Kempinski, Sheraton, Pullman, and Aloft (Mall of the Emirates and Deira City Centres) earns 6% — see dining category.' }, // Signature
    { id: '240fd59c-2a82-4fce-a3b6-fe94789fffd1', notes: '⚠️ Hotel room bookings earn the standard rate. Hotel dining at Kempinski, Sheraton, Pullman, and Aloft (Mall of the Emirates and Deira City Centres) earns 4% — see dining category.' }, // Platinum

    // ── travel (Private only — partner discounts are merchant offers, not SHARE Points) ──
    { id: 'e468d319-a18c-4d56-8c16-8f6c2c91499e', notes: '⚠️ Agoda, Booking.com, IHG, and gettransfer.com partner discounts are merchant-level offers — they do not stack additional SHARE Points on top of the standard earn rate.' }, // Private
  ];

  let ok = 0, fail = 0;

  // Update card summaries
  for (const { id, summary } of summaryUpdates) {
    const { error } = await supabase.from('cards').update({ summary }).eq('id', id);
    if (error) { console.error(`FAIL card summary ${id}:`, error.message); fail++; }
    else { ok++; }
  }

  // Set notes to null
  for (const id of nullIds) {
    const { error } = await supabase.from('card_rewards').update({ notes: null }).eq('id', id);
    if (error) { console.error(`FAIL null notes ${id}:`, error.message); fail++; }
    else { ok++; }
  }

  // Apply specific notes
  for (const { id, notes } of specificUpdates) {
    const { error } = await supabase.from('card_rewards').update({ notes }).eq('id', id);
    if (error) { console.error(`FAIL specific notes ${id}:`, error.message); fail++; }
    else { ok++; }
  }

  console.log(`Done: ${ok} updated, ${fail} failed.`);
  console.log(`  Card summaries: ${summaryUpdates.length}`);
  console.log(`  Notes → null: ${nullIds.length}`);
  console.log(`  Notes → specific: ${specificUpdates.length}`);
})();
