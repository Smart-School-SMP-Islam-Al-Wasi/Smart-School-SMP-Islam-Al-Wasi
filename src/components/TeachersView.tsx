import React, { useState } from 'react';
import { Teacher, UserRole } from '../types';
import { addTeacher, deleteTeacher } from '../firebase';

interface TeachersViewProps {
  teachers: Teacher[];
  currentRole: UserRole;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  currentRole,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    fullName: '',
    subject: '',
    phone: '',
    email: '',
    status: 'Aktif' as 'Aktif' | 'Cuti',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.nip.trim() || !formData.subject.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addTeacher({
        nip: formData.nip.trim(),
        fullName: formData.fullName.trim(),
        subject: formData.subject.trim(),
        phone: formData.phone.trim() || '081234567890',
        email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/[^a-z]/g, '')}@alwasi.sch.id`,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
      });

      setShowAddModal(false);
      setFormData({
        nip: '',
        fullName: '',
        subject: '',
        phone: '',
        email: '',
        status: 'Aktif',
      });
    } catch (err) {
      console.error('Add teacher error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus data guru ${name}?`)) {
      try {
        await deleteTeacher(id);
      } catch (err) {
        console.error('Delete teacher error', err);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>👨‍🏫</span>
            <span>Dewan Guru & Tenaga Kependidikan</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {teachers.length} Guru
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            {currentRole === 'admin'
              ? 'Administrator memiliki hak akses penuh menginput dan mengelola data guru.'
              : 'Data dewan guru dan staf pengajar resmi SMP Islam Al-Wasi\'.'}
          </p>
        </div>

        {currentRole === 'admin' ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>➕</span>
            <span>Tambah Data Guru (Admin)</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">
            <span>🔒</span>
            <span>Input guru dibatasi untuk Admin</span>
          </div>
        )}
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl border border-emerald-100">
                    <span>👨‍🏫</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {teacher.fullName}
                    </h4>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {teacher.subject}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    teacher.status === 'Aktif'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {teacher.status}
                </span>
              </div>

              <div className="space-y-1 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">NIP / NUPTK:</span>
                  <span className="font-mono text-slate-700">{teacher.nip}</span>
                </div>
                {teacher.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 truncate max-w-[180px]">{teacher.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Terdaftar:</span>
                  <span className="text-slate-700">{teacher.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                <span>💬</span>
                <span>WhatsApp: {teacher.phone}</span>
              </a>

              {currentRole === 'admin' && (
                <button
                  onClick={() => handleDelete(teacher.id, teacher.fullName)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Hapus Guru"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👨‍🏫</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Input Data Guru Baru</h4>
                  <p className="text-xs text-slate-500">Khusus Administrator Sekolah</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.I"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP / NUPTK *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 19850312 201001 1 008"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran yang Diampu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PAI / Matematika / Tahfidz"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Resmi
                </label>
                <input
                  type="email"
                  placeholder="Contoh: ustadz@alwasi.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kepegawaian
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Cuti' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                >
                  <option value="Aktif">Aktif Mengajar</option>
                  <option value="Cuti">Cuti</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? '⏳' : '💾'}</span>
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
