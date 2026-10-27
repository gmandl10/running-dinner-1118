export default async function handler(req, res) {
  // Allow requests from your GitHub Pages domain (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace '*' with 'https://your-username.github.io' for production
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Load hidden secret API URL from environment variables
  const SHEETDB_URL = process.env.SHEETDB_URL;

  if (!SHEETDB_URL) {
    return res.status(500).json({ error: 'Server configuration error: SHEETDB_URL missing' });
  }

  try {
    const { firstName, lastName, email, phone, street, houseNo, coursePref, dietary } = req.body;

    // Basic server-side validation
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

    // Forward the request to SheetDB securely
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
