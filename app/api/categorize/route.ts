import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = [
  { slug: "dining",          name: "Dining",            icon: "🍽️",  description: "Restaurants, cafés, fast food, food delivery (Talabat, Deliveroo), coffee shops" },
  { slug: "groceries",       name: "Groceries",         icon: "🛒",  description: "Supermarkets, hypermarkets, convenience stores, online grocery delivery" },
  { slug: "fuel",            name: "Fuel",              icon: "⛽",  description: "Petrol stations (ADNOC, ENOC, Emarat), fuel delivery (CAFU)" },
  { slug: "airlines",        name: "Airlines",          icon: "✈️",  description: "Airline ticket purchases directly from airlines (Emirates, Etihad, flydubai, Qatar Airways)" },
  { slug: "shopping",        name: "Shopping & Fashion",icon: "🛍️",  description: "Clothing, fashion, department stores, electronics, home goods, jewellery, beauty, footwear" },
  { slug: "hotels",          name: "Hotels",            icon: "🏨",  description: "Hotel stays (Marriott, Hilton, Jumeirah), resort bookings" },
  { slug: "travel",          name: "Other Travel",      icon: "🗺️",  description: "Travel agencies, online booking platforms (Booking.com, Airbnb, Agoda), car rentals, ride-hailing (Careem, Uber)" },
  { slug: "online_shopping", name: "Online Shopping",   icon: "💻",  description: "E-commerce platforms (Amazon.ae, Noon, Shein, AliExpress, Namshi), online-only retailers" },
  { slug: "entertainment",   name: "Entertainment",     icon: "🎬",  description: "Cinemas, theme parks, streaming (Netflix, Spotify), concerts, gaming, leisure attractions" },
  { slug: "utilities",       name: "Utilities",         icon: "💡",  description: "Electricity (DEWA, SEWA), telecom (Etisalat/e&, du), toll/transport cards (Salik, Nol)" },
  { slug: "education",       name: "Education",         icon: "📚",  description: "School fees, university tuition, online courses (Udemy, Coursera), language learning" },
  { slug: "insurance",       name: "Insurance",         icon: "🛡️",  description: "Health, motor, home, life insurance premiums" },
  { slug: "government",      name: "Government",        icon: "🏛️",  description: "Government service fees, fines, visa charges (RTA, ICA, DLD, MOHRE, municipality)" },
  { slug: "rent",            name: "Rent",              icon: "🏠",  description: "Property rental payments, real estate agencies (Ejari, Bayut, Property Finder)" },
  { slug: "healthcare",      name: "Healthcare",        icon: "🏥",  description: "Hospitals, clinics, pharmacies, dentists, opticians, health supplements" },
  { slug: "general",         name: "General",           icon: "💳",  description: "Gyms, fitness clubs, pet services, miscellaneous spend not fitting other categories" },
];

const client = new Anthropic();

export async function GET(req: NextRequest) {
  const merchant = req.nextUrl.searchParams.get("merchant")?.trim();

  if (!merchant || merchant.length < 2) {
    return NextResponse.json({ error: "merchant param required (min 2 chars)" }, { status: 400 });
  }

  if (merchant.length > 100) {
    return NextResponse.json({ error: "merchant name too long" }, { status: 400 });
  }

  const categoryList = CATEGORIES.map(
    (c) => `- ${c.slug}: ${c.name} — ${c.description}`
  ).join("\n");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: `You are a UAE spending category classifier for a credit card rewards app.
Given a merchant name, identify the single best spending category from the list below.
The context is UAE (United Arab Emirates) — consider regional merchant knowledge.

Categories:
${categoryList}

Respond ONLY with a valid JSON object — no markdown, no explanation — in this exact shape:
{"slug":"<category_slug>","confidence":"high"|"medium"|"low","reason":"<one short sentence>"}

Use "low" confidence if the merchant is ambiguous or unknown. Always pick the most likely category.`,
      messages: [
        { role: "user", content: `Merchant name: "${merchant}"` },
      ],
    });

    const text = (message.content[0] as { type: string; text: string }).text.trim();

    let parsed: { slug: string; confidence: string; reason: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI returned unparseable response" }, { status: 500 });
    }

    const cat = CATEGORIES.find((c) => c.slug === parsed.slug);
    if (!cat) {
      return NextResponse.json({ error: "AI returned unknown category slug" }, { status: 500 });
    }

    return NextResponse.json({
      slug: cat.slug,
      name: cat.name,
      icon: cat.icon,
      confidence: parsed.confidence,
      reason: parsed.reason,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/categorize] Claude error:", msg);
    return NextResponse.json({ error: "AI classification failed" }, { status: 500 });
  }
}
