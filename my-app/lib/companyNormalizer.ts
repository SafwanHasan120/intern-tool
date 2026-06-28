// Company name normalization and alias mapping

// Canonical company names and their aliases
const COMPANY_ALIASES: Record<string, string> = {
  // Meta ecosystem
  facebook: 'meta',
  instagram: 'meta',
  whatsapp: 'meta',
  // JPMorgan variants
  'jp morgan': 'jpmorgan',
  'jpmorgan chase': 'jpmorgan',
  'jpm': 'jpmorgan',
  'j.p. morgan': 'jpmorgan',
  // DE Shaw variants
  'd.e. shaw': 'de shaw',
  'deshaw': 'de shaw',
  // Google/Alphabet
  'alphabet': 'google',
  'google': 'google',
  // Goldman variants
  'goldman sachs': 'goldman sachs',
  'gs': 'goldman sachs',
  // Morgan Stanley variants
  'morgan stanley': 'morgan stanley',
  'ms': 'morgan stanley',
  // McKinsey variants
  'mckinsey': 'mckinsey',
  'mckinsey & company': 'mckinsey',
  // BCG variants
  'bcg': 'bcg',
  'boston consulting group': 'bcg',
  // Bain variants
  'bain': 'bain',
  'bain & company': 'bain',
  // HRT variants
  'hudson river trading': 'hudson river trading',
  'hrt': 'hudson river trading',
  // Imc variants
  'imc trading': 'imc',
  'imc': 'imc',
  // Two Sigma
  'two sigma': 'two sigma',
  '2sigma': 'two sigma',
  // Citadel variants
  'citadel': 'citadel',
  'citadel securities': 'citadel',
  // Jane Street variants
  'jane street': 'jane street',
  // Jump variants
  'jump trading': 'jump trading',
  // Optiver variants
  'optiver': 'optiver',
  'optiver usa': 'optiver',
  // Susquehanna variants
  'susquehanna': 'susquehanna',
  'susquehanna international': 'susquehanna',
  // Point72 variants
  'point72': 'point72',
  'sac capital': 'point72',
  // Akuna variants
  'akuna capital': 'akuna capital',
  // DRW variants
  'drw': 'drw',
  'drw trading': 'drw',
  // SIG variants
  'sig': 'sig',
  'susquehanna international group': 'sig',
  // Stripe
  'stripe': 'stripe',
  // Plaid
  'plaid': 'plaid',
  // Databricks
  'databricks': 'databricks',
  // Figma
  'figma': 'figma',
  // Notion
  'notion': 'notion',
  // Microsoft variants
  'microsoft': 'microsoft',
  'msft': 'microsoft',
  // Amazon variants
  'amazon': 'amazon',
  'aws': 'amazon',
  // Apple variants
  'apple': 'apple',
  'aapl': 'apple',
  // Netflix
  'netflix': 'netflix',
  // Nvidia
  'nvidia': 'nvidia',
  // OpenAI
  'openai': 'openai',
  // Anthropic
  'anthropic': 'anthropic',
  // Tesla
  'tesla': 'tesla',
  // SpaceX
  'spacex': 'spacex',
  'space x': 'spacex',
  // Palantir
  'palantir': 'palantir',
  // Uber
  'uber': 'uber',
  // Lyft
  'lyft': 'lyft',
  // Airbnb
  'airbnb': 'airbnb',
  'air bnb': 'airbnb',
  // LinkedIn
  'linkedin': 'linkedin',
  // Salesforce
  'salesforce': 'salesforce',
  // Adobe
  'adobe': 'adobe',
  // Oracle
  'oracle': 'oracle',
  // IBM
  'ibm': 'ibm',
  'international business machines': 'ibm',
  // Intel
  'intel': 'intel',
  // AMD
  'amd': 'amd',
  // Qualcomm
  'qualcomm': 'qualcomm',
  // PayPal
  'paypal': 'paypal',
  // Block (formerly Square)
  'block': 'block',
  'square': 'block',
  'square inc': 'block',
  // Coinbase
  'coinbase': 'coinbase',
  // Robinhood
  'robinhood': 'robinhood',
  // Snowflake
  'snowflake': 'snowflake',
  // Datadog
  'datadog': 'datadog',
  // Cloudflare
  'cloudflare': 'cloudflare',
  // Snap
  'snap': 'snap',
  'snapchat': 'snap',
  // Pinterest
  'pinterest': 'pinterest',
  // DoorDash
  'doordash': 'doordash',
  'door dash': 'doordash',
  // Instacart
  'instacart': 'instacart',
  // Dropbox
  'dropbox': 'dropbox',
  // Twilio
  'twilio': 'twilio',
  // Atlassian
  'atlassian': 'atlassian',
  // Roblox
  'roblox': 'roblox',
  // Bloomberg
  'bloomberg': 'bloomberg',
  // Capital One
  'capital one': 'capital one',
  // Samsung
  'samsung': 'samsung',
  // Sony
  'sony': 'sony',
  // Spotify
  'spotify': 'spotify',
  // Reddit
  'reddit': 'reddit',
};

export function normalizeCompanyName(name: string): string {
  if (!name) return '';

  // Trim and lowercase
  const normalized = name.trim().toLowerCase();

  // Check aliases
  if (normalized in COMPANY_ALIASES) {
    return COMPANY_ALIASES[normalized];
  }

  return normalized;
}

export function canonicalName(name: string): string {
  return normalizeCompanyName(name);
}

export function addAlias(alias: string, canonical: string): void {
  COMPANY_ALIASES[alias.toLowerCase()] = canonical.toLowerCase();
}

export function getAliasMap(): Record<string, string> {
  return { ...COMPANY_ALIASES };
}
