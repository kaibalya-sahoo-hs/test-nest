import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import creds from '../../your-service-account-key.json'; // The file you downloaded

const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const updateTestResult = async (testId, status) => {
  const doc = new GoogleSpreadsheet('12bz0fmv82nDRmZcLtT3zpig_l8mfnv6H97gRzOKPuMs', serviceAccountAuth);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByIndex[2]; // The first tab
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.get('ID') === testId);
  if (row) {
    row.set('Status', status);
    row.set('Last Run', new Date().toLocaleString());
    await row.save();
  }
};