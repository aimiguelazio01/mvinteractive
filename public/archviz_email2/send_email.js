/**
 * MVs Archviz — Email Sender via Resend
 * 
 * Sends full HTML emails from hello@mvirgilstudio.com
 * with images, links, and all styling intact.
 * 
 * Setup:
 *   1. npm install resend
 *   2. Replace YOUR_API_KEY below with your Resend API key
 *   3. Run: node send_email.js
 */

import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ═══════════════════════════════════════════
//  CONFIGURATION — Edit these values
// ═══════════════════════════════════════════

const RESEND_KEYS = {
  '1': process.env.RESEND_API_KEY_1 || process.env.RESEND_API_KEY || '',
  '2': process.env.RESEND_API_KEY_2 || ''
};

// Pass "resend 1" or "resend 2" via CLI arg (e.g. node send_email.js "resend 2") or edit below
const resendArg = process.argv.find(arg => arg.toLowerCase().includes('resend') || arg === '1' || arg === '2');
const API_KEY_CHOICE = resendArg ? (resendArg.includes('2') || resendArg === '2' ? '2' : '1') : '1';
const API_KEY = RESEND_KEYS[API_KEY_CHOICE];
const KEY_LABEL = API_KEY_CHOICE === '2' ? 'resend 2' : 'resend 1';

const FROM_NAME = 'MVs Archviz';
const FROM_EMAIL = 'hello@mvirgilstudio.com';  // Your verified domain email

// Where replies go (your personal Gmail)
const REPLY_TO = 'mvirgilstudio@gmail.com';

// Recipients — add as many as you need
const RECIPIENTS = [
  'winmiguelazio@gmail.com'
];

// Which template to send: 'en' for English, 'pt' for Portuguese
const LANGUAGE = 'pt';

// Email subject (lowercase recommended for deliverability, automatically chooses based on language)
const SUBJECT = LANGUAGE === 'pt' ? 'Maquetes Interativas para Apresentações de Arquitetónicas' : 'architectural visualization services';

// ═══════════════════════════════════════════
//  SEND LOGIC — No need to edit below
// ═══════════════════════════════════════════

async function sendEmail() {
  const resend = new Resend(API_KEY);

  // Pick the right template
  const templateFile = LANGUAGE === 'pt' ? 'email_pt.html' : 'email_en.html';
  const htmlPath = path.join(__dirname, templateFile);

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Template not found: ${htmlPath}`);
    process.exit(1);
  }

  const rawHtml = fs.readFileSync(htmlPath, 'utf8');
  
  let html = rawHtml;

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

  // 1. Strip any <script> tags for deliverability (spam filters block emails with scripts)
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Strip large CSS animation/gallery blocks (causes low text-to-code ratio and spam flags)
  html = html.replace(/\/\* CSS Image Fade Transitions[\s\S]*?(?=\<\/style\>)/i, '');

  // 3. Strip structural "id" attributes from HTML tags to avoid "non-standard HTML elements" warnings in email clients
  html = html.replace(/\s+id="[^"]*"/gi, '');

  // 4. Boost small font sizes (9px, 10px, 11px) to a readable minimum (12px) to fix "HTML Font is bad readable"
  html = html.replace(/font-size:\s*(9|10|11)px/gi, 'font-size: 12px');

  console.log(`🔑 Resend API Key: ${KEY_LABEL}`);
  console.log(`📧 Sending ${LANGUAGE.toUpperCase()} email from ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`📝 Subject: ${SUBJECT}`);
  console.log(`📎 Template: ${templateFile}`);
  console.log('');

  for (let i = 0; i < RECIPIENTS.length; i++) {
    const recipient = RECIPIENTS[i];
    console.log(`📨 Sending email ${i + 1}/${RECIPIENTS.length} to: ${recipient}...`);
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
      }
    } catch (err) {
      console.error(`❌ Error sending to ${recipient}:`, err.message);
    }

    // Add a 1-second delay between sending to individual recipients to avoid rate limits
    if (i < RECIPIENTS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

sendEmail();
