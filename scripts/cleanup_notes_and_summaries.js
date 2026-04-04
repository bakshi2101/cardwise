const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://hlbxxmbwgnaiaorhsqwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYnh4bWJ3Z25haWFvcmhzcXdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU2MjA4OSwiZXhwIjoyMDg5MTM4MDg5fQ.L0dE6cGn22Ns4kJfOcZ88Id0JCR-GO7x04wFEPX9EJM'
);

// ─────────────────────────────────────────────
// NOTES CLEANUP FUNCTION
// Removes: VERIFIED prefix, Clause X: prefix, source citations (PDF filenames),
//          clause numbers, (KFS) and per KFS, per help page, legalese phrases.
// Keeps: substantive rate info, caps, exclusions, useful conversion factors.
// ─────────────────────────────────────────────
function cleanNotes(notes) {
  if (!notes) return notes;
  let n = notes;

  // 1. Remove "VERIFIED." / "VERIFIED " prefix at start of string
  n = n.replace(/^VERIFIED\.?\s*/i, '');

  // 2. Remove "Clause X: " or "Clause X.X: " prefix at start
  n = n.replace(/^Clause\s+[\d.]+:\s*/i, '');

  // 3. Remove source blocks that contain "Verified YYYY-MM-DD"
  //    Covers: Mashreq (Source: file.pdf + file.pdf + url. Verified date.)
  //            ENBD Skywards (Source: ENBD help page (url), verified date.)
  n = n.replace(/\s*Source:[\s\S]*?verified\s+\d{4}-\d{2}-\d{2}\.?\s*/gi, ' ');

  // 4. Remove source sentences with only a PDF filename (no Verified date)
  //    Covers: ENBD LuLu (Source: filename.pdf.)
  //            ENBD Marriott (Source: filename.pdf (clauses X-Y).)
  n = n.replace(/\s*Source:\s+[\w\-]+\.pdf[^.]*\.\s*/g, ' ');

  // 5. Remove "Source: FAB Rewards T&C ..." type references (FAB cards)
  n = n.replace(/\s*Source:\s+FAB[^.]+\.\s*/g, ' ');

  // 6. Remove any remaining standalone "Verified YYYY-MM-DD."
  n = n.replace(/\s*[Vv]erified\s+\d{4}-\d{2}-\d{2}\.?\s*/g, ' ');

  // 7. Simplify "(low-interchange tier ...legalese...)" → "(low-interchange tier)"
  n = n.replace(/\(low-interchange tier[^)]*\)/gi, '(low-interchange tier)');

  // 8. Remove "(not in the low-interchange exclusion list...)" parentheticals
  n = n.replace(/\s*\(not in[^)]*low-interchange[^)]*\)\s*/gi, ' ');

  // 9. Remove "(clause X.X)" / "(clauses X-Y)" parentheticals
  n = n.replace(/\s*\((?:T&C\s+)?clauses?\s+[\d.,\-]+\)/gi, '');

  // 10. Remove "per T&C clause X.X" inline references
  n = n.replace(/\s*per\s+T&C\s+clause\s+[\d.]+/gi, '');

  // 11. Remove "(T&C clause X.X)" parentheticals
  n = n.replace(/\s*\(T&C\s+clause\s+[\d.]+\)/gi, '');

  // 12. Remove "(KFS)" standalone
  n = n.replace(/\s*\(KFS\)/g, '');

  // 13. Remove "per KFS" inline references
  n = n.replace(/\s*per\s+KFS\b/gi, '');

  // 14. Remove "per help page:" (before a quote or text) — drop the prefix, keep the content
  n = n.replace(/\s*[Pp]er help page:\s+/g, '');

  // 15. Remove "per help page" (inline, without colon)
  n = n.replace(/\s*per help page\b/gi, '');

  // 16. Remove "Specific bonus tier per T&C reward table." (LuLu notes)
  n = n.replace(/\s*Specific bonus tier per T&C reward table\.\s*/gi, ' ');

  // 17. Remove "falls under '...' per KFS" parentheticals
  n = n.replace(/\s*\(falls under "[^"]*"[^)]*\)/g, '');
  n = n.replace(/\s*falls under "[^"]*"(?:\s+per KFS)?\s*/gi, ' ');

  // 18. Remove "(KFS and T&C clause X.X)" or "KFS/T&C clause X.X"
  n = n.replace(/\s*KFS\/T&C clause\s+[\d.]+/gi, '');

  // 19. Remove "Titanium earns exactly 50% of Platinum rate per T&C table." (LuLu Titanium)
  n = n.replace(/\s*\[Titanium earns exactly 50% of Platinum rate per T&C table\.\]\s*/gi, '');

  // 20. Fix double spaces and trim
  n = n.replace(/\s{2,}/g, ' ').trim();

  // 21. Fix space before period
  n = n.replace(/\s+\./g, '.').trim();

  // 22. Fix orphaned " and ." or " and," at end of parentheticals
  n = n.replace(/\(\s*and\s*\)/g, '').replace(/\(\s*\)/g, '');

  // 23. Remove leading/trailing whitespace one more time
  n = n.trim();

  return n;
}

// ─────────────────────────────────────────────
// CARD SUMMARIES — all 52 cards
// Written as highlight-focused bullet points.
// Format: • [Key highlight] on new line
// ─────────────────────────────────────────────
const SUMMARIES = {
  // ── VERIFIED CARDS ──

  // FAB Cashback Islamic
  '120cabc8-903a-4c17-ba49-cea19b032024':
`• Best for everyday spending — 5% cashback at supermarkets, fuel stations, and dining
• Shariah-compliant: no interest; bars, liquor, and gambling merchants are blocked
• 3% on all international purchases; 1% on all other retail
• Caps: AED 200/category/month (UAE nationals), AED 150 (expats); AED 1,500 total cap
• Requires AED 3,000 prior-month spend to activate bonus category rates
• Annual fee: AED 300`,

  // FAB Rewards Indulge
  '181c5bb4-dda3-4bc4-9837-548d6233e3e0':
`• Best for online shopping — 1.5% return on all e-commerce platforms
• Dining discounts at 150+ partner restaurants; AED 20 movie tickets at partner cinemas
• 20% off Namshi fashion; Emaar and Dubai Holding entertainment discounts
• No annual fee, no minimum spend requirement`,

  // FAB Elite
  'c81819f3-e125-4836-87ec-5f31c24e5e44':
`• Best for luxury lifestyle — up to 6% return on 15 curated luxury brands; 1.5% everyday
• Premium fitness: 65+ gyms and beach clubs via adv+ (requires AED 10,000/month spend)
• 5 valet parkings/month; 14 airport lounge visits/year; concierge and golf program
• USD 500,000 travel insurance; annual fee: AED 1,500`,

  // FAB Travel
  '725ddfe3-27cc-4f7f-befd-0f6f46750d44':
`• Best for travel bookings — 12% effective return on airlines and hotels (highest in UAE)
• Zero forex markup — no hidden fees on any international purchase
• Free return flight on card activation, and again annually at AED 300,000 spend
• 14+6 airport lounge visits/year; Booking.com 7% off; Trip.com 20% off; IHG 15% off
• Earn cap: AED 1,800/month; requires AED 5,000 prior-month spend; annual fee: AED 900`,

  // FAB Cashback
  '280e6381-8b2c-4e70-942c-715f6b9a0e47':
`• Best for dining, groceries, and fashion — 5% cashback on all three (AED 150 cap each)
• 3% on all international purchases; 1% on general retail
• Combined monthly cap: AED 1,000; requires AED 3,000 prior-month spend
• Annual fee: AED 300`,

  // FAB Etihad Guest Platinum
  '3902a2da-f5ed-4e17-8c7f-fc6a0ef6627e':
`• Entry-level Etihad miles card — 1% earn on everyday domestic spend
• 2% when booking directly on Etihad.com; 1.75% on international spend
• 10,000 joining Etihad Guest miles for new cardholders
• Monthly earn cap: 10,000 miles; annual fee: AED 500`,

  // FAB Etihad Guest Signature
  'b3dbe91b-c571-42c8-b34a-6fb094fc72f3':
`• Mid-tier Etihad miles card — 1.375% domestic, 2.75% direct Etihad bookings
• Complimentary airport lounge access (1,000+ Visa Signature lounges worldwide)
• 6 complimentary airport transfers/year; 35,000 joining miles
• Monthly earn cap: 30,000 miles; annual fee: AED 1,500`,

  // FAB Etihad Guest Infinite
  'a6143824-9e57-4d0c-94f9-244e786d245f':
`• Premium Etihad miles card — 1.75% domestic, 3.5% direct Etihad bookings
• Unlimited airport lounge access + 1 guest (Visa Infinite, 1,000+ lounges)
• 55,000 joining miles; Etihad Gold Elite status fast-track
• USD 2.5M travel insurance; monthly earn cap: 55,000 miles; annual fee: AED 2,500`,

  // FAB SHARE Rewards
  '90f93562-e611-43a4-b4ae-2190614f7c1b':
`• Best free card for Carrefour shoppers — 6.5% SHARE Points at all Carrefour stores
• 2% at Mall of Emirates, City Centers, and MAF entertainment (VOX, Ski Dubai, Dreamscape)
• 1 complimentary VOX Cinema 2-for-1 ticket/month; 1.5% on all other retail
• Free for life — no annual fee, no minimum spend`,

  // FAB SHARE Platinum
  '0e5d78c7-c248-4454-a4f8-0730f83edb46':
`• Best for Carrefour and MAF entertainment — 6.5% at Carrefour; 3% at MAF malls and venues
• 3 VOX Cinema 2-for-1 tickets/month; 10,000 SHARE Points signup bonus
• Purchase protection and extended warranty included
• Annual fee: AED 1,000`,

  // FAB SHARE Signature
  'd93e4308-d644-4446-83a9-6664831f9a77':
`• Premium Carrefour and MAF card — 6.5% Carrefour; 5% MAF malls and entertainment
• Unlimited airport lounge access (1,000+ Visa Signature lounges); medical and travel insurance
• 4 VOX Cinema 2-for-1 tickets/month; 15,000 SHARE Points signup bonus
• Annual fee: AED 1,500`,

  // Blue FAB Platinum
  '2892571f-4cb0-42f3-9a81-2b1ccf661e4a':
`• Best free Al-Futtaim card — 5% at AF Retail brands (IKEA, Toyota, Marks & Spencer, ACE)
• 2% at AF Other brands; 1% on all other retail
• 4 cinema tickets at AED 20/month; 2 complimentary airport transfers/year
• USD 5,000 purchase protection; monthly reward cap: AED 2,000; free for life`,

  // Blue FAB Signature
  '0fceaea7-6524-4f6c-8fbc-2c15c0f18a76':
`• 6% at Al-Futtaim Retail brands; 3% at AF Other brands; 1% everywhere else
• Unlimited airport lounge access (1,000+ Visa Signature lounges)
• 4 cinema tickets at AED 20/month; 2 complimentary airport transfers/year
• USD 6,000 purchase protection; monthly reward cap: AED 3,000; free for life`,

  // Blue FAB Infinite
  '48b6b764-2b45-4318-bb2d-e7ffe1077158':
`• Premium Al-Futtaim card — 8% at AF Retail brands; 4% at AF Other brands; 1% everywhere else
• Unlimited airport lounge access + 1 guest (Visa Infinite, 1,000+ lounges)
• ENTERTAINER app: 5,000+ travel 2-for-1 deals; 6 cinema tickets at AED 20/month
• 6 complimentary airport transfers/year; USD 7,500 purchase protection
• Monthly reward cap: AED 4,000; free for life | Minimum salary: AED 40,000`,

  // FAB GEMS World
  '89694563-025f-4aed-8bfe-a639f5e4a901':
`• Best for GEMS school families — 10% return on GEMS school services (bus, canteen, uniform, activities)
• Note: school tuition fees earn only 0.15% — the 10% bonus applies to school activities only
• 2% on international purchases; 1% on all other domestic retail
• 8 airport lounge visits/year + 1 guest; 2 cinema tickets at AED 20/month
• Annual fee waived with AED 24,000+ non-education spend; otherwise AED 399`,

  // FAB Z Card
  '2a73dd2b-244f-4ec8-9a21-3b14ba7b67b0':
`• Best for international spenders — zero forex markup, no currency conversion fees
• Lowest FAB interest rate: 1.99%/month (vs 3.5% standard)
• Flat 0.3% on all retail (same rate domestically and internationally)
• Free Careem Plus + noon One for 1 year; 2 cinema tickets at AED 20/month
• First year free; AED 300/year after | Minimum salary: AED 5,000`,

  // FAB ADNOC Rewards
  '95c8b7ec-b63c-4cc8-9a72-053516038574':
`• Best for ADNOC fuel regulars — 15% effective return at ADNOC stations (highest fuel rate in UAE)
• 3% at Salik, DARB, and Mawaqif (road tolls and parking)
• 2% on international purchases; 1% on groceries and general retail
• Mastercard Travel Pass lounge access (1,300+ lounges); 2 cinema tickets at AED 20/month
• Annual fee waived in year 2 at AED 48,000 annual spend; otherwise AED 300`,

  // ENBD Skywards Infinite
  '3d65db6f-0554-4b4c-8c45-8c3ed632c03d':
`• Best for Emirates and flydubai frequent flyers — 3.82% Skywards miles on direct bookings
• 1.91% on all general domestic spend; 2.86% on non-EU/UK international
• 1 Skywards mile = AED 0.07; 1 USD = AED 3.672
• Spend cap: AED 100,000/billing cycle; annual fee: AED 1,575`,

  // ENBD Skywards Signature
  'c734bcbd-030c-4025-8f6c-5a9cc182856b':
`• Mid-tier Skywards miles card — 2.86% on Emirates and flydubai direct bookings
• 1.43% on all general domestic spend; 1.91% on non-EU/UK international
• 0.75 miles per USD domestic; 1 Skywards mile = AED 0.07; 1 USD = AED 3.672
• Spend cap: AED 50,000/billing cycle; annual fee: AED 735`,

  // ENBD LuLu Platinum
  '452af159-574a-442a-8d16-00d3602c4551':
`• Best for regular LuLu shoppers — 7% return in-store and online at all LuLu Hypermarkets
• 4% on fuel; 2% on utility bill payments
• LuLu Points capped at 1,667/month (= AED 1,667); redeemable only at LuLu stores
• 1 LuLu Point = AED 1; annual fee: AED 262.50`,

  // ENBD LuLu Titanium
  '0aa24804-b189-48dc-8624-0596e1a08072':
`• Free LuLu co-branded card — 3.5% at LuLu Hypermarkets (in-store and online)
• 2% on fuel; 1% on utility bills
• 1 LuLu Point = AED 1; redeemable only at LuLu outlets
• Free for life — no annual fee`,

  // ENBD Marriott World Elite
  'db1fbcd8-a9b5-4ee5-a027-f538d171d624':
`• Best for Marriott Bonvoy loyalists — complimentary Gold Elite status (late checkout, room upgrades)
• 2.45% on all general domestic and international spend (3 Bonvoy points/USD)
• Free Night Award on card anniversary — up to 50,000-point night at any Marriott worldwide
• Bonvoy points transferable to 40+ airline programs; annual fee: AED 1,575`,

  // ENBD Marriott World Mastercard
  '892c745d-6c18-4457-b605-78cee4db03fc':
`• Entry-level Marriott Bonvoy card — Silver Elite status + Free Night Award (up to 35K-point night)
• 1.23% on all general domestic and international spend (1.5 Bonvoy points/USD)
• Earns exactly 50% of the World Elite rate at every spending category
• Bonvoy points transferable to 40+ airline programs; annual fee: AED 315`,

  // Mashreq Cashback
  '13377082-51d8-449e-b55f-b918e6c553ed':
`• Best for dining — 5% cashback at all restaurants and food delivery apps, locally and internationally
• 1% on groceries, shopping, airlines, hotels, travel, entertainment, and healthcare
• No annual fee, no minimum spend; cashback credited directly to your card statement
• Minimum redemption: AED 100; cashback valid for 36 months`,

  // Mashreq Noon
  '639b7470-a5d0-4a5e-b213-89ba25248afc':
`• Best for noon shoppers — 5% cashback across the entire noon ecosystem
• Covers noon.com, noon Food (delivery), NowNow (groceries), SIVVI, Namshi, noon Minutes
• Unlimited free next-day delivery on noon express orders
• 1% on all other purchases; 0.33% on fuel, utilities, government, education, and rent
• Cashback goes to your noon Account — redeemable on noon platforms only; valid 12 months
• Free for life — no annual fee`,

  // ── UNVERIFIED CARDS ──

  // ADCB TouchPoints Gold
  '400202ee-e8eb-42f9-9733-5286f08f76fc':
`• Earns 0.5 TouchPoints per AED on all domestic spend
• 5,000 bonus points when spending AED 5,000+/month
• VOX Cinema 2-for-1 (2 tickets/month); 20% off Talabat orders
• Free for life — no annual fee`,

  // ADCB TouchPoints Infinite
  '5062d5a3-88d5-48dc-96c5-5471409cd5dc':
`• Earns 1.5 TouchPoints per AED on all spend
• 15,000 bonus points when spending AED 15,000+/month
• VOX Cinema Theatre/Gold class 2-for-1; 15% off noon; 20% off Talabat
• Annual fee: AED 1,200`,

  // ADCB TouchPoints Platinum
  '5ce98d94-f54f-418c-90cb-d2d7c17267c3':
`• Earns 1 TouchPoint per AED on all spend
• 10,000 bonus points when spending AED 10,000+/month
• VOX Cinema 2-for-1; golf at Arabian Ranches and Abu Dhabi Golf Club (AED 5,000+ spend)
• Annual fee: AED 500`,

  // ADIB Cashback Visa Covered
  '021d6769-871f-4c9d-8610-0587fbb171ed':
`• 4% cashback on groceries, fuel, automotive services, education, dining, and utilities
• Capped at AED 1,000/month combined across all categories
• 4 free supplementary cards; Shariah-compliant
• Annual fee: AED 99`,

  // ADIB SHARE Infinite
  '1012c93e-b3ca-4359-b45c-8c04aa7459aa':
`• Best for Carrefour (MAF) — 6% SHARE Points at Carrefour and MAF-affiliated brands
• 2% on international purchases; Shariah-compliant
• Unlimited airport lounge access + 1 guest; valet 4x/month
• Annual fee: AED 1,500`,

  // ADIB SHARE Platinum
  'f1246274-59b3-4991-9df9-6b9c7aaf9748':
`• 3% SHARE Points at Carrefour and MAF brands; 1.25% on international spend
• 1 complimentary valet/month; roadside assistance once/year
• Shariah-compliant; annual fee: AED 500`,

  // CBD Super Saver
  '8cdc79fb-a327-4156-bd55-6562c1bea028':
`• Up to 10% cashback on B.E.S.T. categories: bills, education, supermarkets, transport and fuel
• Tiered by total monthly spend; AED 150 cap per category, AED 600/month combined
• Annual fee: AED 420`,

  // Citi Cash Back
  'd3d6c3bf-9672-4823-a228-70a29deab454':
`• Best for international and grocery spending — 3% on non-AED, 2% on groceries
• 1% on all other purchases; no minimum spend, no monthly caps
• No categories excluded from earning cashback
• Annual fee: AED 300`,

  // Citi Premier
  '758d5d43-c8c4-4ca4-b111-7e41190ba11b':
`• Flexible travel rewards — 3x ThankYou Points on dining, fuel, and groceries
• 2x on international purchases; points transfer to 12 airline and hotel partners
• 6 complimentary Careem airport rides/year
• Annual fee: AED 600`,

  // Citi Prestige
  '41e18546-d724-4fb3-a9b8-8835298f6138':
`• Premium travel card — 50% off airline tickets (up to AED 2,000) once/year
• Free 3rd night at any hotel, unlimited times per year
• Points transfer to 11 airline programs including Turkish, Qatar, and British Airways
• Annual fee: AED 1,575`,

  // DIB Consumer Cashback Platinum
  '08c7baed-b9de-42bf-8056-a33f96b94175':
`• Up to 4% cashback on supermarkets, fuel, and utility bills
• Shariah-compliant; annual fee: AED 249`,

  // DIB Consumer Cashback Reward
  '7bb2eb46-24a6-4fed-9bf5-0048f72521d4':
`• Up to 3% cashback on supermarkets, hypermarkets, utility bills, and fuel
• Capped at AED 1,000/month; Shariah-compliant; annual fee: AED 200`,

  // DIB Prime Infinite
  '33ed23d3-0217-4399-b54a-18d560205bc5':
`• High dining return — 6% cashback on dining; 5% on fuel; 2% on groceries, education, entertainment
• Unlimited airport lounge access + 1 guest; valet 4x/month; Fitness First gym access
• Shariah-compliant; annual fee: AED 1,500`,

  // DIB Prime Signature
  '30f9bcd9-787d-4859-bde1-57ee305608ac':
`• 5% cashback on dining and travel; airport lounge access; valet parking; golf access
• Travel and medical coverage up to USD 500,000
• Shariah-compliant; annual fee: AED 750`,

  // DIB Wala'a Infinite
  'da395862-82d9-4d54-9b91-5f12f10c1206':
`• 1.5 Wala'a Rewards per AED on general retail
• Points redeemable for flights, hotels, shopping, and bill payments
• Shariah-compliant; annual fee: AED 1,200`,

  // HSBC Cash+
  '8c6aba09-8f8d-4b8a-8f43-3c9a4a4fb933':
`• Simplest reward structure — 1% cashback on ALL purchases with no exceptions or caps
• 10% annual bonus on total cashback earned each year
• Free Careem Plus subscription included
• Annual fee: AED 1,050`,

  // HSBC Live+
  '052ee2b7-6324-496b-9b7a-3905110987b7':
`• Best for lifestyle spending — 6% dining, 5% fuel, 2% groceries and entertainment
• Requires AED 3,000/month to activate bonus rates; AED 200 cap per category
• 0.5% on all other purchases; annual fee: AED 314`,

  // Liv Cashback
  'e976814e-35b9-41b0-b90a-aeda3fec089a':
`• Simple flat-rate cashback — up to 2% on all spend when spending AED 10,000+/month
• 1.5% at AED 5,000–10,000; 0.75% below AED 5,000; capped at AED 750/month
• Optionally redeemable as Skywards Miles; free for life`,

  // Liv Cashback+
  'f461a75f-aaf0-4940-8f6b-b2b24dd86507':
`• Higher flat-rate cashback — up to 4% on all spend when spending AED 15,000+/month
• 2% at AED 7,000–15,000; 1% below AED 7,000; capped at AED 1,500/month
• Choice of cashback or Skywards Miles redemption; annual fee: AED 700`,

  // Mashreq Platinum Plus
  '25c2e049-d94a-44ef-8bb5-d131eda9e6b5':
`• Earns Mashreq Vantage Points — 10 pts/AED on supermarkets, fuel, and dining
• 6 pts/AED on international purchases; 2 pts/AED on other local spend
• Complimentary airport lounge access when spending AED 7,000+/month
• Annual fee: AED 299`,

  // Mashreq Solitaire
  '9130eaec-f5c5-4b28-907d-8636bf8fb3ec':
`• Flagship Mashreq card — unlimited airport lounge access worldwide
• Complimentary Fitness First gym membership; valet parking; dedicated concierge
• Complimentary airport transfers; travel and lifestyle benefits
• Annual fee: AED 1,500`,

  // RAKBank Elevate
  '06b90da4-14ae-4381-b0a9-cdd64541da54':
`• Subscription-based tiers with travel rewards
• Unlimited airport lounge access + 1 guest; beach clubs, gyms, and padel courts
• Zero forex markup on international purchases; 2x reward value on travel redemptions`,

  // RAKBank Titanium
  '3b954443-8044-47b6-a737-0b703d77d460':
`• 5% cashback on supermarkets and dining when spending AED 5,000+/month
• 50% off cinema tickets; 1–2% on other retail (tiered by spend)
• AED 350 welcome cashback for new cardholders; free for life`,

  // RAKBank World
  '8b4f300b-a2ec-470c-98f5-1be7ea54b8ad':
`• High cashback on lifestyle — 10% on travel, dining, and groceries with AED 10,000+/month spend
• 1% on other retail; 0.25% on government fees, utilities, fuel, and education
• Annual cap: AED 15,000; annual fee: AED 950`,

  // SC Platinum X
  '004c839f-95cc-4d38-ab6a-a2e4725ca808':
`• Up to 10% cashback on online purchases, foreign currency transactions, and mobile wallet spend
• Tiered by monthly spend level; annual fee: AED 525`,

  // SC Simply Cash
  'e3a393f5-bf83-4be8-82aa-44d5d6de3234':
`• 2% cashback on international and airline purchases; 1% on all domestic spend
• Optional 4% bonus on dining, groceries, entertainment, and education with opt-in
• Annual fee: AED 525`,

  // Wio
  'eef85749-a7da-4975-82fe-eae4f5bcae53':
`• Simplest return — 2% cashback on ALL purchases with no category restrictions
• Zero forex markup on all international purchases
• Capped at AED 2,500/month; unlimited virtual card creation; free for life`,
};

async function run() {
  let errors = 0;
  let notesUpdated = 0;

  // ── STEP 1: Clean up notes on all verified card_rewards ──
  console.log('Step 1: Fetching all verified card_rewards...');
  const { data: rewards, error: re } = await sb
    .from('card_rewards')
    .select('id, notes')
    .not('last_verified_date', 'is', null);
  if (re) { console.error('Fetch error:', re.message); return; }
  console.log(`  Found ${rewards.length} verified reward rows`);

  for (const row of rewards) {
    const cleaned = cleanNotes(row.notes);
    if (cleaned === row.notes) continue; // no change
    const { error } = await sb.from('card_rewards').update({ notes: cleaned }).eq('id', row.id);
    if (error) { console.error('  ✗ notes update', row.id, error.message); errors++; }
    else notesUpdated++;
  }
  console.log(`  Updated ${notesUpdated} rows, ${errors} errors`);

  // ── STEP 2: Update summaries for all cards ──
  console.log('\nStep 2: Updating card summaries...');
  let summaryErrors = 0;
  let summaryUpdated = 0;
  for (const [cardId, summary] of Object.entries(SUMMARIES)) {
    const { error } = await sb.from('cards').update({ summary }).eq('id', cardId);
    if (error) { console.error('  ✗ summary', cardId, error.message); summaryErrors++; }
    else summaryUpdated++;
  }
  console.log(`  Updated ${summaryUpdated} summaries, ${summaryErrors} errors`);

  console.log(`\nDone. Total errors: ${errors + summaryErrors}`);
}

run();
