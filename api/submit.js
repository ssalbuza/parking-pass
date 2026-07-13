import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { date, dept, receiver, items } = req.body;
    if (!date || !dept || !receiver || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: '입력값이 올바르지 않습니다.' });
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const rows = items.map((item) => [
      new Date().toISOString(),
      date,
      dept,
      receiver,
      item.type || '',
      item.purpose || '',
      item.car || '',
      item.person || '',
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: '수불대장!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows },
    });

    res.status(200).json({ result: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}