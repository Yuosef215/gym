const twilio = require('twilio');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let client = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

exports.sendWhatsApp = async (to, message) => {
  if (!client) {
    throw new Error('Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN env vars.');
  }
  const formatted = to.startsWith('whatsapp:') ? to : `whatsapp:+2${to.replace(/[^0-9]/g, '')}`;
  return await client.messages.create({
    from: TWILIO_WHATSAPP_NUMBER,
    body: message,
    to: formatted,
  });
};