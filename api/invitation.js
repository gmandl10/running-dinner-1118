export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  const SHEETDB_URL = process.env.SHEETDB_URL;
  if (!SHEETDB_URL) {
    return res.status(500).json({ error: 'SHEETDB_URL environment variable missing' });
  }

  try {
    // Query SheetDB specifically for the matching email
    const searchUrl = `${SHEETDB_URL}/search?email=${encodeURIComponent(email.trim().toLowerCase())}&casesensitive=false`;
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error('Failed to query database');

    const rows = await response.json();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No registration found for this email address.' });
    }

    const p = rows[0];

    // Return only the fields needed for this participant's invitation
    return res.status(200).json({
      firstName: p.firstName || 'Guest',
      assignedRole: p.assignedRole || '',
      starterLocation: p.starterLocation || '',
      starterExtra: p.starterExtra || '',
      mainLocation: p.mainLocation || '',
      mainExtra: p.mainExtra || '',
      hosting: p.hosting || '',
      secretMission: p.secretMission || ''
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
