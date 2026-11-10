import React, { useState } from 'react';
import { Student, ClassRoom } from '../types';
import { addStudent } from '../firebase';

interface SpmbViewProps {
  onSuccessRegistered: (newStudent: Student) => void;
  onNavigateToStudents: () => void;
}

export const SpmbView: React.FC<SpmbViewProps> = ({
  onSuccessRegistered,
  onNavigateToStudents,
}) => {
  const [formData, setFormData] = useState({
    nisn: '',
    fullName: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    birthPlace: '',
    birthDate: '',
    classRoom: '7A' as ClassRoom,
    parentName: '',
    parentPhone: '',
    previousSchool: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRegisteredStudent, setLastRegisteredStudent] = useState<Student | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const generateAutoNisn = () => {
    const randomNisn = `00${Math.floor(10000000 + Math.random() * 90000000)}`;
    setFormData((prev) => ({ ...prev, nisn: randomNisn }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Nama lengkap siswa wajib diisi.');
      return;
    }
    if (!formData.nisn.trim()) {
      setErrorMessage('NISN wajib diisi atau tekan tombol Buat Otomatis.');
      return;
    }
    if (!formData.parentName.trim() || !formData.parentPhone.trim()) {
      setErrorMessage('Nama dan nomor WhatsApp orang tua/wali wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const studentData: Omit<Student, 'id'> = {
        nisn: formData.nisn.trim(),
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        birthPlace: formData.birthPlace.trim() || 'Jakarta',
        birthDate: formData.birthDate || '2013-01-01',
        classRoom: formData.classRoom,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        previousSchool: formData.previousSchool.trim() || 'SD / MI Sederajat',
        status: 'Baru',
        registrationDate: new Date().toISOString().split('T')[0],
        notes: formData.notes.trim() || 'Pendaftar Jalur Reguler SPMB',
      };

      const newId = await addStudent(studentData);
      const createdStudent: Student = { ...studentData, id: newId };
      setLastRegisteredStudent(createdStudent);
      onSuccessRegistered(createdStudent);

      // Reset form
      setFormData({
        nisn: '',
        fullName: '',
        gender: 'Laki-laki',
        birthPlace: '',
        birthDate: '',
        classRoom: '7A',
        parentName: '',
        parentPhone: '',
        previousSchool: '',
        notes: '',
      });
    } catch (err: unknown) {
      console.error('SPMB Registration Error:', err);
      setErrorMessage('Gagal menyimpan data ke Firestore. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Notification Banner */}
      {lastRegisteredStudent && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 shadow-xs transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h4 className="text-base font-bold text-emerald-900">
                  Pendaftaran SPMB Berhasil Disimpan!
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Peserta didik <strong>{lastRegisteredStudent.fullName}</strong> (NISN: {lastRegisteredStudent.nisn}) telah otomatis terdaftar ke kelas <strong>{lastRegisteredStudent.classRoom}</strong> dan masuk ke database Firestore.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={onNavigateToStudents}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Lihat di Daftar Siswa →
                  </button>
                  <button
                    onClick={() => setLastRegisteredStudent(null)}
                    className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
                  >
                    Tutup Notifikasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
              <span>📋</span>
              <span>Formulir SPMB Online 2025/2026</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900">
              Biodata Calon Peserta Didik Baru
            </h3>
            <p className="text-xs text-slate-500">
              Isi biodata lengkap siswa. Data langsung tersinkronisasi ke database sekolah.
            </p>
          </div>
          <span className="hidden sm:inline-block text-3xl">✍️</span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Pribadi Siswa */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span>1️⃣</span>
              <span>Identitas Peserta Didik</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Azzam Alfatih"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* NISN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    NISN *
                  </label>
                  <button
                    type="button"
                    onClick={generateAutoNisn}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline"
                  >
                    Buat Otomatis
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0098765432"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'Laki-laki' })}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      formData.gender === 'Laki-laki'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👦 Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'Perempuan' })}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      formData.gender === 'Perempuan'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👧 Perempuan
                  </button>
                </div>
              </div>

              {/* Pilihan Kelas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penempatan Rombongan Belajar (Kelas) *
                </label>
                <select
                  value={formData.classRoom}
                  onChange={(e) => setFormData({ ...formData, classRoom: e.target.value as ClassRoom })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                >
                  <option value="7A">Kelas 7A (Tahfidz Unggulan)</option>
                  <option value="7B">Kelas 7B (Sains & Bahasa)</option>
                  <option value="8A">Kelas 8A</option>
                  <option value="8B">Kelas 8B</option>
                  <option value="9A">Kelas 9A</option>
                  <option value="9B">Kelas 9B</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Orang Tua & Asal Sekolah */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span>2️⃣</span>
              <span>Orang Tua / Wali & Asal Sekolah</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Orang Tua */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Orang Tua / Wali *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Hendra Irawan"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* WhatsApp Orang Tua */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp Orang Tua (Untuk Notifikasi Presensi) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081287654321"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Asal Sekolah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Sekolah (SD / MI)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SDIT Nurul Iman"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Catatan / Peminatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peminatan / Catatan Khusus
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Peminatan Tahfidz Al-Qur'an"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? '⏳' : '💾'}</span>
              <span>{isSubmitting ? 'Menyimpan ke Database...' : 'Simpan Biodata & Masukkan ke Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
