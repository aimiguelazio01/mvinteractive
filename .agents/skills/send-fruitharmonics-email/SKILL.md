---
name: send-fruitharmonics-email
description: Send the MVs Fruit Harmonics Portuguese or English marketing email (email_pt.html or email_en.html) to a specified recipient email address via Resend API. Use when the user asks to send the fruit harmonics email.
---

# Send Fruit Harmonics Email

Sends the MVs Fruit Harmonics HTML email template to a recipient using the Resend API.

## When to Use

Use this skill when the user asks to:
- Send the fruit harmonics email / fruit installation email to an email address
- Send `email_pt.html` or `email_en.html` from `fruitharmonics_email` directory to someone

## Prerequisites

- Node.js installed on the system
- The `resend` npm package is already installed in the project dependencies

## How to Execute

1. The user provides a **destination email address** (required), optionally a **language** (`pt` or `en`, defaults to `pt`), and optionally a **Resend API option** (`resend 1` or `resend 2`, defaults to `resend 1`).
2. Run the `send_to.js` script from the `fruitharmonics_email` directory.

### Command

```powershell
node send_to.js <RECIPIENT_EMAIL> [LANGUAGE] [RESEND_OPTION]
```

**Working directory:** `c:\Users\corsair\Desktop\_web_page\public\fruitharmonics_email`

### Examples

```powershell
# Send Portuguese email with default API (resend 1)
node send_to.js client@example.com

# Send English email with resend 1
node send_to.js client@example.com en

# Send Portuguese email using resend 2 API
node send_to.js client@example.com "resend 2"

# Send English email using resend 2 API
node send_to.js client@example.com en "resend 2"
```

## Resend API Options

- **resend 1**: `re_gZJjsYD4...` (Current / Default API key)
- **resend 2**: `re_MxHZ1ptm...` (Secondary API key)

If the user mentions "resend 1" or "resend 2" in their request, pass `"resend 1"` or `"resend 2"` as an argument to `send_to.js`.

## What Happens

- The script loads `email_pt.html` (or `email_en.html`) from the same directory
- Applies deliverability optimizations (strips scripts, IDs, boosts small fonts)
- Sends via Resend API from `MVs Fruta Interativa <hello@mvirgilstudio.com>` using the selected API key
- Replies go to `mvirgilstudio@gmail.com`

## Configuration Details

| Setting    | Value                                                                              |
|------------|------------------------------------------------------------------------------------|
| From       | MVs Fruta Interativa \<hello@mvirgilstudio.com\>                                   |
| Reply-To   | mvirgilstudio@gmail.com                                                            |
| Subject PT | Instalações Interativas com Frutas para Feiras e Eventos           |
| Subject EN | Fruit Harmonics: Interactive Audio-Tactile Installation                            |
| Resend 1   | re_gZJjsYD4... (Default)                                                           |
| Resend 2   | re_MxHZ1ptm...                                                                     |

## Files Reference

| File            | Purpose                              |
|-----------------|--------------------------------------|
| `send_to.js`    | CLI sender script (use this one)     |
| `email_pt.html` | Portuguese HTML email template       |
| `email_en.html` | English HTML email template          |
