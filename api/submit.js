export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHEETDB_URL = process.env.SHEETDB_URL;
  if (!SHEETDB_URL) {
    return res.status(500).json({ error: 'SHEETDB_URL environment variable is missing on Vercel' });
  }

  try {
    const { firstName, lastName, email, phone, street, houseNo, coursePref, dietary } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      street,
      houseNo,
      coursePref,
      dietary,
      timestamp: new Date().toLocaleString()
    };

    const response = await fetch(SHEETDB_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 201) {
      return res.status(200).json({ success: true, message: 'Registration saved' });
    } else {
      const errorText = await response.text();
      return res.status(500).json({ error: 'SheetDB forwarding failed', details: errorText });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
