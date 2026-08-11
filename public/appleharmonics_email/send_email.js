/**
 * MVs Apple Harmonics — Configurable Email Sender via Resend
 * 
 * Usage:
 *   node send_email.js [resend_option]
 * 
 * Options:
 *   node send_email.js "resend 1"
 *   node send_email.js "resend 2"
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

const resendArg = process.argv.find(arg => arg.toLowerCase().includes('resend') || arg === '1' || arg === '2');
const API_KEY_CHOICE = resendArg ? (resendArg.includes('2') || resendArg === '2' ? '2' : '1') : '1';
const API_KEY = RESEND_KEYS[API_KEY_CHOICE];
const KEY_LABEL = API_KEY_CHOICE === '2' ? 'resend 2' : 'resend 1';

const FROM_NAME = 'MVs Apple Harmonics';
const FROM_EMAIL = 'hello@mvirgilstudio.com';
const REPLY_TO = 'mvirgilstudio@gmail.com';

const RECIPIENTS = [
  'winmiguelazio@gmail.com'
];

const LANGUAGE = 'pt';
const SUBJECT = LANGUAGE === 'pt' 
  ? 'Instalação Interativa com Maçã de Alcobaça para Feiras e Eventos' 
  : 'Apple Harmonics: Interactive Audio-Tactile Installation';

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
                    style="background-color: #131313; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); border: 1px solid #222222; margin-bottom: 20px;">
                    <tr>
                        <td class="mobile-padding" style="padding: 28px 32px; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; color: #e5e2e1;">
                            Olá,<br>
                            O meu nome é Miguel Virgílio. Sou de Alcobaça e desenvolvo aplicações 3D interativas para apresentar produtos, espaços e processos de forma mais envolvente.<br>
                            Desenvolvi a "Sinfonia da Maçã", uma instalação interativa onde o toque na Maçã de Alcobaça real dispara notas musicais e arte visual em tempo real num ecrã.<br>
                            Uma atração tecnológica incrível para destacar os vossos stands em feiras ou lojas.<br>
                            Gostaria de partilhar uma breve apresentação do projeto que desenvolvi.
                        </td>
                    </tr>
                </table>`
    : `<!-- Personal Message -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container"
                    style="background-color: #131313; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); border: 1px solid #222222; margin-bottom: 20px;">
                    <tr>
                        <td class="mobile-padding" style="padding: 28px 32px; font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.6; color: #e5e2e1;">
                            Hello,<br><br>
                            My name is Miguel Virgílio and I create interactive 3D applications to showcase products, spaces, and processes in a more engaging way.<br><br>
                            I created "Apple Harmonics", an interactive installation where touching real apples triggers musical notes and visual art in real-time on screen.<br><br>
                            An incredible tech attraction to highlight your stands at trade shows or stores.<br><br>
                            I would like to share a brief presentation of the project I developed.
                        </td>
                    </tr>
                </table>`;

  html = html.replace('<!-- Main Container -->', `${introText}\n                <!-- Main Container -->`);

  html = html.replace(/src="\/appleharmonics_email\//g, 'src="https://mvirgilstudio.com/appleharmonics_email/');
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/\s+id="[^"]*"/gi, '');
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

    if (i < RECIPIENTS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

sendEmail();
