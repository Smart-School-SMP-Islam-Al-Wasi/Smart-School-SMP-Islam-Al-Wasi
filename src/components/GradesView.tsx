import React, { useState } from 'react';
import { Student, AcademicGrade, ClassRoom, UserRole } from '../types';
import { recordGrade, deleteGrade } from '../firebase';

interface GradesViewProps {
  students: Student[];
  grades: AcademicGrade[];
  currentRole: UserRole;
}

const SUBJECT_LIST = [
  'PAI & Budi Pekerti',
  'Tahfidz & Bahasa Arab',
  'Matematika',
  'IPA Terpadu',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPS Terpadu',
  'Pendidikan Pancasila',
];

export const GradesView: React.FC<GradesViewProps> = ({
  students,
  grades,
  currentRole,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [selectedSubject, setSelectedSubject] = useState<string>('SEMUA');
  const [showInputModal, setShowInputModal] = useState(false);

  // Form State
  const [targetStudentId, setTargetStudentId] = useState('');
  const [subjectInput, setSubjectInput] = useState(SUBJECT_LIST[0]);
  const [assignmentScore, setAssignmentScore] = useState<number>(85);
  const [midExamScore, setMidExamScore] = useState<number>(85);
  const [finalExamScore, setFinalExamScore] = useState<number>(85);
  const [teacherNameInput, setTeacherNameInput] = useState('Ust. Abdullah Mansur, S.Pd.I');
  const [isSaving, setIsSaving] = useState(false);

  // Compute final score & predicate
  const computedFinal = Math.round((assignmentScore * 0.3 + midExamScore * 0.35 + finalExamScore * 0.35) * 10) / 10;
  const computedPredicate: 'A' | 'B' | 'C' | 'D' =
    computedFinal >= 88 ? 'A' : computedFinal >= 78 ? 'B' : computedFinal >= 70 ? 'C' : 'D';

  const filteredGrades = grades.filter((g) => {
    const matchClass = selectedClass === 'SEMUA' || g.classRoom === selectedClass;
    const matchSubj = selectedSubject === 'SEMUA' || g.subject === selectedSubject;
    return matchClass && matchSubj;
  });

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === targetStudentId);
    if (!student) return;

    setIsSaving(true);
    const newGrade: AcademicGrade = {
      id: `grd-${student.id}-${subjectInput.replace(/[^a-zA-Z0-9]/g, '_')}`,
      studentId: student.id,
      studentName: student.fullName,
      classRoom: student.classRoom,
      subject: subjectInput,
      semester: 'Ganjil 2025/2026',
      assignment: Number(assignmentScore),
      midExam: Number(midExamScore),
      finalExam: Number(finalExamScore),
      finalScore: computedFinal,
      predicate: computedPredicate,
      teacherName: teacherNameInput.trim() || 'Guru Pengampu',
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      await recordGrade(newGrade);
      setShowInputModal(false);
      setTargetStudentId('');
    } catch (err) {
      console.error('Failed to record grade', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGrade = async (id: string, name: string) => {
    if (window.confirm(`Hapus nilai akademik untuk ${name}?`)) {
      try {
        await deleteGrade(id);
      } catch (e) {
        console.error('Delete grade error', e);
      }
    }
  };

  const classList = ['SEMUA', '7A', '7B', '8A', '8B', '9A', '9B'];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📝</span>
            <span>Nilai Akademik & Rapor Peserta Didik</span>
          </h3>
          <p className="text-xs text-slate-500">
            Penilaian berbasis Kriteria Ketuntasan Minimal (KKM 75.0) dengan bobot tugas & ujian.
          </p>
        </div>

        {currentRole !== 'wali_murid' && (
          <button
            onClick={() => {
              if (students.length > 0) {
                setTargetStudentId(students[0].id);
              }
              setShowInputModal(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>➕</span>
            <span>Input Nilai Siswa</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Class Filter */}
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

        {/* Subject Filter */}
        <div className="w-full sm:w-64">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
          >
            <option value="SEMUA">Semua Mata Pelajaran</option>
            {SUBJECT_LIST.map((sb) => (
              <option key={sb} value={sb}>{sb}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredGrades.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <span className="text-3xl">📊</span>
            <p className="text-sm font-semibold text-slate-700">Belum ada data nilai akademik.</p>
            <p className="text-xs text-slate-500">Gunakan tombol "Input Nilai Siswa" untuk menambahkan data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">Tugas (30%)</th>
                  <th className="py-3 px-4 text-center">UTS (35%)</th>
                  <th className="py-3 px-4 text-center">UAS (35%)</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4">Ketuntasan</th>
                  {currentRole === 'admin' && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredGrades.map((grd) => {
                  const isTuntas = grd.finalScore >= 75;
                  return (
                    <tr key={grd.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{grd.studentName}</p>
                        <p className="text-[11px] text-slate-500">{grd.teacherName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                          {grd.classRoom}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {grd.subject}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{grd.assignment}</td>
                      <td className="py-3 px-4 text-center font-mono">{grd.midExam}</td>
                      <td className="py-3 px-4 text-center font-mono">{grd.finalExam}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm text-slate-900 font-mono">
                          {grd.finalScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                            grd.predicate === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grd.predicate === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : grd.predicate === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {grd.predicate}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isTuntas ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          <span>{isTuntas ? '✓' : '✗'}</span>
                          <span>{isTuntas ? 'Tuntas' : 'Remedial'}</span>
                        </span>
                      </td>
                      {currentRole === 'admin' && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteGrade(grd.id, grd.studentName)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                            title="Hapus Nilai"
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input Grade Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Input Nilai Akademik Siswa</h4>
                  <p className="text-xs text-slate-500">Hasil perhitungan otomatis tersimpan ke Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik *
                </label>
                <select
                  required
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} (Kelas {st.classRoom} - {st.nisn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran *
                  </label>
                  <select
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  >
                    {SUBJECT_LIST.map((sb) => (
                      <option key={sb} value={sb}>{sb}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guru Pengampu
                  </label>
                  <input
                    type="text"
                    value={teacherNameInput}
                    onChange={(e) => setTeacherNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* 3 Component Scores */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tugas (30%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={assignmentScore}
                    onChange={(e) => setAssignmentScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-center focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UTS (35%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={midExamScore}
                    onChange={(e) => setMidExamScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-center focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    UAS (35%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={finalExamScore}
                    onChange={(e) => setFinalExamScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-center focus:outline-hidden focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Calculation Preview Box */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Kalkulasi Otomatis:</span>
                  <span className="text-xs text-emerald-900 font-medium">
                    (Tugas × 0.3) + (UTS × 0.35) + (UAS × 0.35)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-900 block font-mono">
                    {computedFinal}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-emerald-700 text-white">
                    Predikat {computedPredicate}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInputModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>{isSaving ? '⏳' : '💾'}</span>
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
