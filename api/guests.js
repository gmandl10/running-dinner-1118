export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHEETDB_URL = process.env.SHEETDB_URL;
  if (!SHEETDB_URL) {
    return res.status(500).json({ error: 'SHEETDB_URL environment variable is missing on Vercel' });
  }

  try {
    const response = await fetch(SHEETDB_URL);
    if (!response.ok) throw new Error("Failed to fetch from SheetDB");
    
    const fullData = await response.json();

    // Privacy filter: return only first names to client
    const safeGuests = fullData.map(p => ({
      firstName: p.firstName || "Guest"
    }));

    return res.status(200).json(safeGuests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
