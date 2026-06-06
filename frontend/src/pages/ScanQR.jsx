import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';

const ScanQR = () => {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        scanner.stop().catch(() => {});
        setScanning(false);
        try {
          const res = await api.post('/attendance/scan-qr', { qrData: decodedText });
          setScanResult({ success: true, data: res.data });
        } catch (err) {
          setScanResult({ success: false, message: err.response?.data?.message || 'Scan failed' });
        }
      },
      () => {}
    ).catch((err) => setError('Camera access denied or not available'));

    return () => { scanner.stop().catch(() => {}); };
  }, [scanning]);

  return (
    <div className="scan-qr-page">
      <h1>QR Attendance Scan</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {scanning && (
        <div className="scanner-container">
          <div id="qr-reader" style={{ width: 300, margin: '0 auto' }}></div>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: 12 }}>
            Point camera at member's QR code
          </p>
        </div>
      )}

      {scanResult && (
        <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
          {scanResult.success ? (
            <>
              <div className="checkmark-circle">&#10003;</div>
              <h2>Check-in Successful</h2>
              <p>{scanResult.data.member?.name} checked in at {new Date(scanResult.data.checkIn).toLocaleTimeString()}</p>
              <button className="btn btn-primary" onClick={() => { setScanResult(null); setScanning(true); setError(''); }}>
                Scan Another
              </button>
            </>
          ) : (
            <>
              <div className="x-circle">&#10007;</div>
              <h2>Scan Failed</h2>
              <p>{scanResult.message}</p>
              <button className="btn btn-primary" onClick={() => { setScanResult(null); setScanning(true); setError(''); }}>
                Try Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanQR;