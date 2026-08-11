import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function logEmailToExcel(emailData) {
  const excelPath = path.join(__dirname, 'sent_fruitharmonics_emails.xlsx');
  let workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(excelPath)) {
    await workbook.xlsx.readFile(excelPath);
    worksheet = workbook.getWorksheet('Sent Fruit Harmonics Emails') || workbook.addWorksheet('Sent Fruit Harmonics Emails');
  } else {
    worksheet = workbook.addWorksheet('Sent Fruit Harmonics Emails');
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Recipient Email', key: 'to', width: 32 },
      { header: 'Sender', key: 'from', width: 32 },
      { header: 'Subject', key: 'subject', width: 50 },
      { header: 'Status / Last Event', key: 'last_event', width: 18 },
      { header: 'Sent At (UTC)', key: 'created_at', width: 25 },
      { header: 'Message ID', key: 'message_id', width: 65 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1A1C1C' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  let exists = false;
  worksheet.eachRow((row) => {
    if (row.getCell(1).value === emailData.id) {
      exists = true;
    }
  });

  if (!exists) {
    worksheet.addRow({
      id: emailData.id || '',
      to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
      from: emailData.from || 'MVs Fruit Harmonics <hello@mvirgilstudio.com>',
      subject: emailData.subject || '',
      last_event: emailData.last_event || 'delivered',
      created_at: emailData.created_at || new Date().toISOString(),
      message_id: emailData.message_id || ''
    });
  }

  await workbook.xlsx.writeFile(excelPath);
}
