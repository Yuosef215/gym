import { useState } from 'react';
import QRCode from 'react-qr-code';
import api from '../../api/axios';

const QRModal = ({ member, onClose }) => {
  const [qrCode, setQrCode] = useState(member.qrCode || null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/members/${member._id}/generate-qr`);
      setQrCode(res.data.qrCode);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{member.name} - QR Code</h2>
        {qrCode ? (
          <div className="qr-display">
            <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200 }} />
          </div>
        ) : (
          <div className="qr-display">
            <QRCode value={member._id} size={200} />
            <p style={{ marginTop: 8, color: '#94a3b8', fontSize: 13 }}>
              Secure QR with digital signature
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={generateQR} disabled={loading}>
            {loading ? 'Generating...' : qrCode ? 'Regenerate' : 'Generate QR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;