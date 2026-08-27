import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm';

// ── EmailJS credentials ───────────────────────────────────────────────────────
// Sign up at https://www.emailjs.com, then:
//   1. Add an email service (e.g. Gmail) under Email Services
//   2. Create two templates (see variable names below) under Email Templates
//   3. Copy your Public Key from Account → API Keys
const SERVICE_ID      = 'service_ypox87o';
const PUBLIC_KEY      = '1S2mbGGsSDqGP6zFh';
const MATCH_TEMPLATE  = 'template_ham4yn4';
const CLAIM_TEMPLATE  = 'template_esz44c3';

// Template variables expected:
//   Match template : {{to_email}}, {{item_name}}, {{other_item_name}}, {{item_url}}
//   Claim template : {{to_email}}, {{claimer_name}}, {{claimer_email}}, {{item_name}}, {{item_url}}

emailjs.init({ publicKey: PUBLIC_KEY });

/**
 * Notify both parties when two reports are matched.
 * Errors are swallowed — email failure must never block the main flow.
 */
export async function sendMatchNotification({ reporterEmail, matchEmail, itemName, matchItemName, reportUrl, matchUrl }) {
  if (!SERVICE_ID || SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') return;
  await Promise.allSettled([
    emailjs.send(SERVICE_ID, MATCH_TEMPLATE, {
      to_email: reporterEmail,
      item_name: itemName,
      other_item_name: matchItemName,
      item_url: matchUrl,
    }),
    emailjs.send(SERVICE_ID, MATCH_TEMPLATE, {
      to_email: matchEmail,
      item_name: matchItemName,
      other_item_name: itemName,
      item_url: reportUrl,
    }),
  ]);
}

/**
 * Notify the item poster when someone submits a claim.
 */
export async function sendClaimNotification({ posterEmail, claimerName, claimerEmail, itemName, itemUrl }) {
  if (!SERVICE_ID || SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') return;
  await emailjs.send(SERVICE_ID, CLAIM_TEMPLATE, {
    to_email: posterEmail,
    claimer_name: claimerName,
    claimer_email: claimerEmail,
    item_name: itemName,
    item_url: itemUrl,
  });
}
