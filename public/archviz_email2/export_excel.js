import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function logEmailToExcel(emailData) {
  const excelPath = path.join(__dirname, 'sent_archviz_emails.xlsx');
  let workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(excelPath)) {
    await workbook.xlsx.readFile(excelPath);
    worksheet = workbook.getWorksheet('Sent ArchViz Emails') || workbook.addWorksheet('Sent ArchViz Emails');
  } else {
    worksheet = workbook.addWorksheet('Sent ArchViz Emails');
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

  // Deduplicate by ID if already exists in worksheet
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
      from: emailData.from || 'MVs Archviz <hello@mvirgilstudio.com>',
      subject: emailData.subject || '',
      last_event: emailData.last_event || 'delivered',
      created_at: emailData.created_at || new Date().toISOString(),
      message_id: emailData.message_id || ''
    });
  }

  await workbook.xlsx.writeFile(excelPath);
}

export async function syncAllResendArchvizEmails() {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY_1 || process.env.RESEND_API_KEY || '');

  let allEmails = [];
  let after = null;

  while (true) {
    const params = { limit: 100 };
    if (after) {
      params.after = after;
    }
    const res = await resend.emails.list(params);
    const list = res.data?.data || [];
    if (!Array.isArray(list) || list.length === 0) break;
    allEmails.push(...list);
    if (!res.data?.has_more) break;
    after = list[list.length - 1].id;
  }

  const excelPath = path.join(__dirname, 'sent_archviz_emails.xlsx');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sent ArchViz Emails');

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

  // Remove duplicates by email ID
  const uniqueEmails = [];
  const seenIds = new Set();
  for (const email of allEmails) {
    if (!seenIds.has(email.id)) {
      seenIds.add(email.id);
      uniqueEmails.push(email);
    }
  }

  uniqueEmails.forEach(e => {
    worksheet.addRow({
      id: e.id,
      to: Array.isArray(e.to) ? e.to.join(', ') : e.to,
      from: e.from,
      subject: e.subject,
      last_event: e.last_event || 'delivered',
      created_at: e.created_at,
      message_id: e.message_id || ''
    });
  });

  await workbook.xlsx.writeFile(excelPath);
  console.log(`✅ Synced ${uniqueEmails.length} unique sent emails into ${excelPath}`);
}

// Execute sync if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncAllResendArchvizEmails().catch(console.error);
}
