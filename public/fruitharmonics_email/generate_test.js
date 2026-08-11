import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateFile = 'email_pt.html';
const htmlPath = path.join(__dirname, templateFile);

let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/src="\/fruitharmonics_email\//g, 'src="https://mvirgilstudio.com/fruitharmonics_email/');
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
html = html.replace(/\s+id="[^"]*"/gi, '');
html = html.replace(/font-size:\s*(9|10|11)px/gi, 'font-size: 12px');

fs.writeFileSync(path.join(__dirname, 'test_email_output.html'), html);
console.log('✅ Generated test_email_output.html');
