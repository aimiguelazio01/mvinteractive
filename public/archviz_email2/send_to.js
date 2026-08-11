/**
 * MVs Archviz — CLI Email Sender
 * 
 * Sends the archviz HTML email to a specified recipient.
 * 
 * Usage:
 *   node send_to.js <recipient_email> [language]
 * 
 * Examples:
 *   node send_to.js client@example.com        # sends Portuguese version
 *   node send_to.js client@example.com en      # sends English version
 */

import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logEmailToExcel } from './export_excel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════

const RESEND_KEYS = {
  '1': process.env.RESEND_API_KEY_1 || process.env.RESEND_API_KEY || '',
  '2': process.env.RESEND_API_KEY_2 || ''
};

const FROM_NAME = 'MVs Archviz';
const FROM_EMAIL = 'hello@mvirgilstudio.com';
const REPLY_TO = 'mvirgilstudio@gmail.com';

// ═══════════════════════════════════════════
//  CLI ARGUMENT PARSING
// ═══════════════════════════════════════════

function parseArgs(rawArgs) {
  let recipientArg = null;
  let language = 'pt';
  let apiKeyChoice = '1';

  for (const arg of rawArgs) {
    if (!arg) continue;
    const lower = arg.trim().toLowerCase();

    if (lower === 'pt' || lower === 'en') {
      language = lower;
      continue;
    }

    if (lower.includes('resend') || lower === '1' || lower === '2' || lower.startsWith('re_')) {
      if (lower.includes('2') || lower === '2') {
        apiKeyChoice = '2';
      } else if (lower.includes('1') || lower === '1') {
        apiKeyChoice = '1';
      } else if (lower.startsWith('re_')) {
        apiKeyChoice = arg.trim();
      }
      continue;
    }

    if (!recipientArg) {
      recipientArg = arg;
    }
  }

  const apiKey = RESEND_KEYS[apiKeyChoice] || (apiKeyChoice.startsWith('re_') ? apiKeyChoice : RESEND_KEYS['1']);
  const keyLabel = apiKeyChoice === '2' ? 'resend 2' : (apiKeyChoice === '1' ? 'resend 1' : apiKeyChoice);

  return { recipientArg, language, apiKeyChoice, apiKey, keyLabel };
}

const { recipientArg, language: LANGUAGE, apiKey: API_KEY, keyLabel: KEY_LABEL } = parseArgs(process.argv.slice(2));

if (!recipientArg) {
  console.error('❌ Usage: node send_to.js <recipient_emails> [language] [resend_option]');
  console.error('   recipient_emails: single email or comma-separated list (e.g. "a@b.com,c@d.com")');
  console.error('   language: "pt" (default) or "en"');
  console.error('   resend_option: "resend 1" (default API) or "resend 2" (secondary API key)');
  process.exit(1);
}

const recipients = recipientArg.split(',').map(email => email.trim()).filter(Boolean);

if (recipients.length === 0) {
  console.error('❌ No valid email address provided.');
  process.exit(1);
}

// Basic email format validation
for (const email of recipients) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`❌ Invalid email address: ${email}`);
    process.exit(1);
  }
}

if (!['pt', 'en'].includes(LANGUAGE)) {
  console.error(`❌ Invalid language "${LANGUAGE}". Use "pt" or "en".`);
  process.exit(1);
}

const SUBJECT = LANGUAGE === 'pt'
  ? 'Maquetes Interativas para Apresentações de Arquitetónicas'
  : 'architectural visualization services';

// ═══════════════════════════════════════════
//  SEND LOGIC
// ═══════════════════════════════════════════

async function sendEmail() {
  const resend = new Resend(API_KEY);

  const templateFile = LANGUAGE === 'pt' ? 'email_pt.html' : 'email_en.html';
  const htmlPath = path.join(__dirname, templateFile);

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Template not found: ${htmlPath}`);
    process.exit(1);
  }

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Insert intro message card above the Main Container
  const introText = LANGUAGE === 'pt'
    ? `<!-- Personal Message -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container"
                    style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px;">
                    <tr>
                        <td class="mobile-padding" style="padding: 32px 32px; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a;">
                            Olá,<br><br>
                            O meu nome é Miguel Virgílio e desenvolvo aplicações interativas para a apresentação de projetos arquitetónicos em tempo real.<br>
                            Gostaria de partilhar uma breve apresentação com alguns dos trabalhos que desenvolvi.
                        </td>
                    </tr>
                </table>`
    : `<!-- Personal Message -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container"
                    style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px;">
                    <tr>
                        <td class="mobile-padding" style="padding: 32px 32px; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a;">
                            Hello! I am Miguel Virgílio.<br>
                            We have developed a Physical-Digital Model solution for high-impact presentations. I leave a brief visual summary below.<br>
                            Best regards.
                        </td>
                    </tr>
                </table>`;

  html = html.replace('<!-- Main Container -->', `${introText}\n                <!-- Main Container -->`);

  // 1. Strip <script> tags for deliverability
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Strip large CSS animation/gallery blocks
  html = html.replace(/\/\* CSS Image Fade Transitions[\s\S]*?(?=\\<\/style\\>)/i, '');

  // 3. Strip structural "id" attributes
  html = html.replace(/\s+id="[^"]*"/gi, '');

  // 4. Boost small font sizes to 12px minimum
  html = html.replace(/font-size:\s*(9|10|11)px/gi, 'font-size: 12px');

  console.log(`🔑 Resend API Key: ${KEY_LABEL}`);
  console.log(`📧 Sending ${LANGUAGE.toUpperCase()} email from ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`📝 Subject: ${SUBJECT}`);
  console.log(`📎 Template: ${templateFile}`);
  console.log('');

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    console.log(`📨 Sending email ${i + 1}/${recipients.length} to: ${recipient}...`);
    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [recipient],
        reply_to: REPLY_TO,
        subject: SUBJECT,
        html: html,
      });

      if (error) {
        console.error(`❌ Failed to send to ${recipient}:`, error);
      } else {
        console.log(`✅ Email sent successfully to ${recipient}!`);
        console.log(`📋 Message ID: ${data.id}`);
        try {
          await logEmailToExcel({
            id: data.id,
            to: recipient,
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            subject: SUBJECT,
            last_event: 'delivered',
            created_at: new Date().toISOString(),
            message_id: data.id
          });
          console.log(`📊 Logged to sent_archviz_emails.xlsx`);
        } catch (excelErr) {
          console.error(`⚠️ Failed to log to Excel:`, excelErr.message);
        }
      }
    } catch (err) {
      console.error(`❌ Error sending to ${recipient}:`, err.message);
    }

    // Add a 1-second delay between sending to individual recipients to avoid rate limits
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

sendEmail();
