const crypto = require('crypto');
const QRCode = require('qrcode');

const QR_SECRET = process.env.QR_SECRET || 'gym_qr_secret_2026';

exports.generateQRPayload = (memberId, gymId) => {
  const payload = `${memberId}:${gymId}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex');
  return `${payload}:${signature}`;
};

exports.verifyQRPayload = (qrString) => {
  const parts = qrString.split(':');
  if (parts.length < 4) return null;

  const signature = parts.pop();
  const payload = parts.join(':');
  const expected = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex');

  if (signature !== expected) return null;
  const [memberId, gymId, timestamp] = payload.split(':');
  if (Date.now() - parseInt(timestamp) > 365 * 86400000) return null;

  return { memberId, gymId };
};

exports.generateQRImage = async (qrString) => {
  return await QRCode.toDataURL(qrString);
};