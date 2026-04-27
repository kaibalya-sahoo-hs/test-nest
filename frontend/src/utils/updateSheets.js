import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const updateTestResult = async (testId, status) => {
  // Skip external Google Sheets calls during tests
  if (process.env.NODE_ENV === 'test') return;

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CRED_PATH.client_email,
    key: process.env.GOOGLE_CRED_PATH.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByIndex[2]; 
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.get('Test case ID') === testId);
  if (row) {
    row.set('Status', status.toUpperCase());
    row.set('Last Tested', new Date().toLocaleDateString());

    await row.save();
  }
};