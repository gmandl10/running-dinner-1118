export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHEETDB_URL = process.env.SHEETDB_URL;

  try {
    const response = await fetch(SHEETDB_URL);
    if (!response.ok) throw new Error("Failed to fetch from sheet");
    
    const fullData = await response.json();

    // PRIVACY FILTER: Sanitize response to return ONLY first names to the client
    const safeGuests = fullData.map(p => ({
      firstName: p.firstName || "Guest"
    }));

    return res.status(200).json(safeGuests);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
