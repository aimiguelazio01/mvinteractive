import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateFile = 'email_pt.html';
const htmlPath = path.join(__dirname, templateFile);

let html = fs.readFileSync(htmlPath, 'utf8');

const introText = `<!-- Personal Message -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container"
                style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 20px;">
                <tr>
                    <td class="mobile-padding" style="padding: 32px 32px; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a;">
                        Olá,<br><br>
                        O meu nome é Miguel Virgílio e desenvolvo aplicações interativas para a apresentação de projetos arquitetónicos em tempo real.<br>
                        Gostaria de partilhar uma breve apresentação com alguns dos trabalhos que desenvolvi.
                    </td>
                </tr>
            </table>`;

html = html.replace('<!-- Main Container -->', `${introText}\n            <!-- Main Container -->`);

// 1. Strip any <script> tags
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// 2. Strip large CSS animation/gallery blocks
html = html.replace(/\/\* CSS Image Fade Transitions[\s\S]*?(?=\<\/style\>)/i, '');

// 3. Strip structural "id" attributes
html = html.replace(/\s+id="[^"]*"/gi, '');

// 4. Boost small font sizes to 12px
html = html.replace(/font-size:\s*(9|10|11)px/gi, 'font-size: 12px');

fs.writeFileSync(path.join(__dirname, 'test_email_output.html'), html);
console.log('Done!');
