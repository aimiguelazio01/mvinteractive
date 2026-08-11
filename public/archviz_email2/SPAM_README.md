# Spam Filter & Deliverability Guide

If your emails are being marked as spam, it is usually due to one of four key factors:
1.  **Link Rewriting & Tracking:** ESPs (Email Service Providers) rewrite links for open and click tracking. Spam filters often flag these rewritten URLs if the tracking domain has a low reputation.
2.  **Hosted Image Blocks:** Many email clients block remote images by default, and some spam filters flag emails containing multiple remote images with a high image-to-text ratio.
3.  **Authentication Records:** Missing SPF, DKIM, or DMARC records for your sender domain.
4.  **Subject Line Casing & Trigger Words:** Capitalized words or aggressive call-to-actions.

---

## 1. Disabling Open and Click Tracking (Recommended)

When using an ESP, turn off link and open tracking. This prevents the ESP from rewriting your clean `https://mvirgilstudio.com` links into tracking redirects.

*   **SendGrid:**
    1. Go to **Settings** > **Tracking**.
    2. Edit **Click Tracking** and set it to **Disabled**.
    3. Edit **Open Tracking** and set it to **Disabled**.
*   **Mailchimp:**
    1. In the campaign builder, scroll to the **Settings & Tracking** section.
    2. Click **Edit** and uncheck **Track opens** and **Track clicks**.
*   **Resend:**
    1. Go to your domain settings or api options.
    2. Disable open/click tracking headers, or pass `tags: [{ name: 'tracking', value: 'false' }]` in your sending call depending on your setup.

---

## 2. Using CID Embedded Images vs. Hosted Images

If you send HTML emails via code (e.g. custom scripts, Node.js, Python), you can embed the images directly in the email body as inline attachments using Content-IDs (`cid:`). This is much safer than hosting images remotely.

We have generated **CID-enabled versions** of your templates:
*   `email_cid.html` (Dynamic version)
*   `email_en_cid.html` (English version)
*   `email_pt_cid.html` (Portuguese version)

Here is how to send them using Python or Node.js:

### Node.js (Nodemailer) Example:
```javascript
const nodemailer = require('nodemailer');
const fs = require('fs');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
});

let mailOptions = {
    from: '"Miguel Virgílio Studio" <your-email@gmail.com>',
    to: 'recipient@example.com',
    subject: 'new portfolio update - miguel virgilio studio',
    html: fs.readFileSync('./email_en_cid.html', 'utf-8'),
    attachments: [
        { filename: 'mvfx_logo.png', path: './assets/mvfx_logo.png', cid: 'mvfx_logo' },
        { filename: 'hero_image2.jpg', path: './assets/hero_image2.jpg', cid: 'hero_image2' },
        { filename: 'imersiva.jpg', path: './assets/imersiva.jpg', cid: 'imersiva' },
        { filename: 'interativo_building.jpg', path: './assets/interativo_building.jpg', cid: 'interativo_building' },
        { filename: 'interactivo_control.jpg', path: './assets/interactivo_control.jpg', cid: 'interactivo_control' },
        { filename: 'splat_canvas_thumbnail.png', path: './assets/splat_canvas_thumbnail.png', cid: 'splat_canvas_thumbnail' },
        { filename: '3d_print.jpg', path: './assets/3d_print.jpg', cid: '3d_print' },
        { filename: 'virtual.jpg', path: './assets/virtual.jpg', cid: 'virtual' },
        { filename: 'panorama.jpg', path: './assets/panorama.jpg', cid: 'panorama' },
        { filename: 'animacoes.jpg', path: './assets/animacoes.jpg', cid: 'animacoes' },
        { filename: '01_house_front.jpg', path: './assets/hero_images_anim/01_house_front.jpg', cid: 'house_front' }
    ]
};

transporter.sendMail(mailOptions);
```

---

## 3. Image-free and Plain Text Alternatives

If sending images continues to trigger filters, try using our **image-free HTML** or **plain text** versions.

*   **Image-free HTML Templates:**
    *   `email_no_images.html` / `email_en_no_images.html` / `email_pt_no_images.html`
    *   These preserve your layout and styles, but replace image slots with clean HTML placeholders/comments.
*   **Plain Text Templates:**
    *   `email_en.txt` / `email_pt.txt`
    *   Contains purely raw text and links. This has near-100% deliverability.

---

## 4. Subject Lines & Content Checks

*   **Subject Casing:** Keep subject lines lowercase and conversational.
    *   *Avoid:* "IMMERSIVE 3D SHOWCASE - ACT NOW!"
    *   *Prefer:* "new portfolio update - miguel virgilio studio" or "archviz interactive update"
*   **Clean Unsubscribe:** If sending marketing campaigns, ensure your ESP's default unsubscribe link points to a trusted domain.
*   **Domain Authentication Checklist:**
    *   Ensure **SPF** (Sender Policy Framework) is configured on your DNS (e.g. `v=spf1 include:_spf.google.com ~all` if sending via Gmail).
    *   Ensure **DKIM** (DomainKeys Identified Mail) signature is enabled for your sender domain.
    *   Ensure a basic **DMARC** record exists (e.g. `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`).
