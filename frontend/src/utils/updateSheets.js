import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import creds from '../../agile-device-493307-g5-07e288ccee39.json';
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const updateTestResult = async (testId, status) => {
  const doc = new GoogleSpreadsheet('12bz0fmv82nDRmZcLtT3zpig_l8mfnv6H97gRzOKPuMs', serviceAccountAuth);
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