import React, { useState } from 'react';
import { Student, ClassRoom, UserRole } from '../types';
import { deleteStudent } from '../firebase';

interface StudentsViewProps {
  students: Student[];
  currentRole: UserRole;
  onNavigateToSpmb: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  currentRole,
  onNavigateToSpmb,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClass === 'SEMUA' || s.classRoom === selectedClass;
    const matchSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus data peserta didik ${name}?`)) {
      try {
        await deleteStudent(id);
      } catch (e) {
        console.error('Delete error', e);
      }
    }
  };

  const classList = ['SEMUA', '7A', '7B', '8A', '8B', '9A', '9B'];

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>👩‍🎓</span>
            <span>Data Peserta Didik Terdaftar</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {filteredStudents.length} Siswa
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Seluruh data siswa dimasukkan langsung melalui formulir SPMB.
          </p>
        </div>

        <button
          onClick={onNavigateToSpmb}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>➕</span>
          <span>Daftar Siswa Baru (SPMB)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Class Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {classList.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedClass === cls
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cls === 'SEMUA' ? 'Semua Kelas' : `Kelas ${cls}`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama / NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Student List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-semibold text-slate-700">Tidak ada data siswa ditemukan.</p>
            <p className="text-xs text-slate-500">Coba ganti filter kelas atau tambahkan siswa melalui SPMB.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Peserta Didik</th>
                  <th className="py-3 px-4">NISN</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Orang Tua / Wali</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4">Asal Sekolah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{st.gender === 'Laki-laki' ? '👦' : '👧'}</span>
                        <div>
                          <p className="font-bold text-slate-900">{st.fullName}</p>
                          <p className="text-[11px] text-slate-500">
                            {st.birthPlace}, {st.birthDate}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {st.nisn}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {st.classRoom}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {st.parentName}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://wa.me/${st.parentPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1"
                      >
                        <span>💬</span>
                        <span>{st.parentPhone}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {st.previousSchool}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveStudent(st)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                          title="Lihat Detail Kartu"
                        >
                          Detail
                        </button>
                        {currentRole === 'admin' && (
                          <button
                            onClick={() => handleDelete(st.id, st.fullName)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                            title="Hapus Data"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪪</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Kartu Data Siswa</h4>
                  <p className="text-xs text-slate-500">SMP Islam Al-Wasi'</p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudent(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-bold text-slate-800">{activeStudent.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">NISN</span>
                <span className="font-mono font-bold text-slate-800">{activeStudent.nisn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Kelas</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  {activeStudent.classRoom}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Jenis Kelamin</span>
                <span className="font-medium text-slate-800">{activeStudent.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                <span className="font-medium text-slate-800">{activeStudent.birthPlace}, {activeStudent.birthDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Orang Tua / Wali</span>
                <span className="font-medium text-slate-800">{activeStudent.parentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Kontak WhatsApp</span>
                <span className="font-bold text-emerald-700">{activeStudent.parentPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Asal Sekolah</span>
                <span className="font-medium text-slate-800">{activeStudent.previousSchool}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tanggal Masuk</span>
                <span className="font-medium text-slate-800">{activeStudent.registrationDate}</span>
              </div>
              {activeStudent.notes && (
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600">
                  <span className="font-bold block mb-0.5">Catatan Khusus:</span>
                  {activeStudent.notes}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveStudent(null)}
              className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
