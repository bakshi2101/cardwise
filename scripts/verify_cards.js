// Helper script for Claude Code to query Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Query card_rewards for a specific card
async function getCardRewards(cardName) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, card_rewards(*)')
    .eq('name', cardName);
  
  if (error) console.error('Error:', error);
  return data;
}

// Query card_benefits for a specific card
async function getCardBenefits(cardName) {
  const { data, error } = await supabase
    .from('cards')
    .select('*, card_benefits(*)')
    .eq('name', cardName);
  
  if (error) console.error('Error:', error);
  return data;
}

// Update card_rewards (Claude will call this)
async function updateCardRewards(cardId, categoryId, updates) {
  const { data, error } = await supabase
    .from('card_rewards')
    .update(updates)
    .eq('card_id', cardId)
    .eq('category_id', categoryId);
  
  if (error) console.error('Error:', error);
  return data;
}

module.exports = { getCardRewards, getCardBenefits, updateCardRewards };
```

Add this to your `.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

---
