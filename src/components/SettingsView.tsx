import React, { useState } from 'react';
import { SchoolProfile, UserRole } from '../types';
import { INITIAL_SCHOOL_PROFILE } from '../data/initialData';
import { seedInitialDataIfEmpty } from '../firebase';

interface SettingsViewProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  onChangeRole,
}) => {
  const [profile, setProfile] = useState<SchoolProfile>(INITIAL_SCHOOL_PROFILE);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const capacitorCommands = [
    {
      title: '1. Pasang Dependensi Capacitor',
      cmd: 'npm install @capacitor/core @capacitor/cli @capacitor/android',
    },
    {
      title: '2. Inisialisasi Proyek Capacitor',
      cmd: 'npx cap init "Smart School Al-Wasi" "com.alwasi.smartschool" --web-dir "dist"',
    },
    {
      title: '3. Build Web App & Tambah Android',
      cmd: 'npm run build && npx cap add android',
    },
    {
      title: '4. Sinkronisasi & Buka Android Studio untuk Build APK',
      cmd: 'npx cap sync && npx cap open android',
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(index);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* School Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-2xl">
              <span>🏫</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{profile.schoolName}</h3>
              <p className="text-xs text-slate-500">NPSN: {profile.npsn} • Status: Terakreditasi A</p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            {profile.academicYear}
          </span>
        </div>

        {isSaved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <span>✅</span>
            <span>Profil sekolah berhasil diperbarui.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lembaga</label>
              <input
                type="text"
                value={profile.schoolName}
                onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kepala Sekolah</label>
              <input
                type="text"
                value={profile.principal}
                onChange={(e) => setProfile({ ...profile, principal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran Aktif</label>
              <input
                type="text"
                value={profile.academicYear}
                onChange={(e) => setProfile({ ...profile, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kontak WhatsApp Sekolah</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Kampus Sekolah</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <span>💾</span>
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Capacitor Android APK Packaging Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl">
              <span>📱</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Panduan Membungkus Aplikasi Menjadi APK (Capacitor)
              </h4>
              <p className="text-xs text-slate-500">
                Aplikasi ini telah siap PWA dan dapat langsung dibungkus menjadi aplikasi Android APK mandiri.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold">
            Android Ready
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {capacitorCommands.map((step, idx) => (
            <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">{step.title}</span>
                <button
                  onClick={() => handleCopy(step.cmd, idx)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>{copiedStep === idx ? '✓ Tersalin' : '📋 Salin'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto">
                {step.cmd}
              </pre>
            </div>
          ))}
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
          <span className="text-base">💡</span>
          <p className="leading-relaxed">
            Setelah perintah <code>npx cap open android</code> dijalankan di komputer Anda, Android Studio akan terbuka secara otomatis. Cukup klik menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> untuk menghasilkan berkas file <strong>.apk</strong> yang siap dipasang di ponsel Android guru, siswa, dan orang tua.
          </p>
        </div>
      </div>

      {/* Cloud & Data Health */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>🔥</span>
            <span>Status Firebase Firestore Database</span>
          </h4>
          <p className="text-xs text-slate-500">
            Database aktif dengan nama koleksi terstruktur (students, teachers, attendance, grades).
          </p>
        </div>

        <button
          onClick={() => {
            seedInitialDataIfEmpty();
            alert('Pemeriksaan dan sinkronisasi data awal berhasil dijalankan!');
          }}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
        >
          🔄 Sinkronisasi Ulang Data Awal
        </button>
      </div>
    </div>
  );
};
