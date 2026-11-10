import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
        <span>✅</span>
        <span>Aplikasi Terpasang</span>
      </span>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition"
          title="Install Smart School sebagai aplikasi"
        >
          <span>📲</span>
          <span>Pasang Aplikasi</span>
        </button>
      )}

      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
        >
          <span>🍎</span>
          <span>Pasang di iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📲</span>
              <h3 className="text-base font-bold text-slate-800">Pasang di iPhone / iPad</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed space-y-2 mb-4">
              1. Buka di browser Safari.<br />
              2. Tekan tombol <strong>Share / Bagikan</strong> <span>📤</span> di bagian bawah layar.<br />
              3. Geser ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong> <span>➕</span>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
