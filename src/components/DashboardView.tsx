import React, { useMemo } from 'react';
import { Student, Teacher, AttendanceRecord, AcademicGrade } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  grades: AcademicGrade[];
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  teachers,
  attendance,
  grades,
  onNavigate,
}) => {
  // Statistics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = useMemo(() => {
    return attendance.filter((a) => a.date === todayStr);
  }, [attendance, todayStr]);

  const attendanceStats = useMemo(() => {
    const records = todayAttendance.length > 0 ? todayAttendance : attendance;
    const hadir = records.filter((r) => r.status === 'Hadir').length;
    const izin = records.filter((r) => r.status === 'Izin').length;
    const sakit = records.filter((r) => r.status === 'Sakit').length;
    const alpa = records.filter((r) => r.status === 'Alpa').length;
    const total = records.length || 1;
    const percentage = Math.round((hadir / total) * 100);

    return { hadir, izin, sakit, alpa, total, percentage };
  }, [todayAttendance, attendance]);

  const averageGrade = useMemo(() => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.finalScore, 0);
    return Math.round((sum / grades.length) * 10) / 10;
  }, [grades]);

  // Subject Averages for Chart
  const subjectScores = useMemo(() => {
    const map: { [subject: string]: { total: number; count: number } } = {};
    for (const g of grades) {
      if (!map[g.subject]) {
        map[g.subject] = { total: 0, count: 0 };
      }
      map[g.subject].total += g.finalScore;
      map[g.subject].count += 1;
    }
    return Object.entries(map).map(([subject, data]) => ({
      subject,
      avg: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }));
  }, [grades]);

  // Predicate Breakdown
  const predicateCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    for (const g of grades) {
      if (counts[g.predicate] !== undefined) {
        counts[g.predicate]++;
      }
    }
    return counts;
  }, [grades]);

  // Weekly Attendance Mock Data for Trend Chart
  const weeklyAttendance = [
    { day: 'Senin', rate: 96 },
    { day: 'Selasa', rate: 94 },
    { day: 'Rabu', rate: 98 },
    { day: 'Kamis', rate: 92 },
    { day: 'Jumat', rate: 95 },
    { day: 'Sabtu', rate: 90 },
  ];

  // High Achievers (Top Students)
  const topStudents = useMemo(() => {
    const studentAvg: { [studentId: string]: { name: string; classRoom: string; total: number; count: number } } = {};
    for (const g of grades) {
      if (!studentAvg[g.studentId]) {
        studentAvg[g.studentId] = { name: g.studentName, classRoom: g.classRoom, total: 0, count: 0 };
      }
      studentAvg[g.studentId].total += g.finalScore;
      studentAvg[g.studentId].count += 1;
    }

    return Object.values(studentAvg)
      .map((s) => ({
        ...s,
        score: Math.round((s.total / s.count) * 10) / 10,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [grades]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <span>🏫</span>
            <span>Tahun Ajaran 2025/2026 Ganjil</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Assalamu'alaikum, Selamat Datang di Smart School
          </h3>
          <p className="text-sm text-slate-500">
            Sistem pemantauan perkembangan peserta didik, presensi real-time, dan akademik SMP Islam Al-Wasi'.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('spmb')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Daftar Siswa Baru (SPMB)</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <span>📅</span>
            <span>Input Presensi</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Peserta Didik</span>
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-lg">👩‍🎓</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{totalStudents}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Terdaftar via SPMB</span>
            <span className="text-emerald-700 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('students')}>
              Lihat →
            </span>
          </div>
        </div>

        {/* Total Guru */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Dewan Guru</span>
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-lg">👨‍🏫</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{totalTeachers}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Diinput oleh Admin</span>
            <span className="text-emerald-700 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('teachers')}>
              Kelola →
            </span>
          </div>
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Kehadiran Hari Ini</span>
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-lg">📅</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-700">
            {attendanceStats.percentage}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {attendanceStats.hadir} Hadir / {attendanceStats.total} Siswa Terdata
          </p>
        </div>

        {/* Rata-Rata Nilai */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Rata-Rata Akademik</span>
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-lg">📝</span>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{averageGrade}</p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            KKM Minimum: 75.0 (Tuntas)
          </p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Diagram Batang Kehadiran Mingguan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>📊</span>
                <span>Grafik Tren Kehadiran Mingguan (%)</span>
              </h4>
              <p className="text-xs text-slate-500">Persentase kehadiran seluruh kelas Senin - Sabtu</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              Target 95%
            </span>
          </div>

          {/* Clean Flat Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-44 flex items-end justify-between gap-2 md:gap-4 px-2 border-b border-slate-200">
              {weeklyAttendance.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 transition group-hover:text-emerald-700">
                    {item.rate}%
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-32">
                    <div
                      style={{ height: `${item.rate}%` }}
                      className="w-full bg-emerald-700 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-600"
                    />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500 px-1">
              <span>Kehadiran rata-rata: <strong>94.2%</strong></span>
              <span className="text-emerald-700 font-semibold cursor-pointer" onClick={() => onNavigate('attendance')}>
                Buka Log Presensi →
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Capaian Nilai per Mata Pelajaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>📈</span>
                <span>Rata-rata Nilai per Mata Pelajaran</span>
              </h4>
              <p className="text-xs text-slate-500">Evaluasi pemahaman materi peserta didik</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              KKM 75
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {subjectScores.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada data nilai akademik.</p>
            ) : (
              subjectScores.map((item) => {
                const isAboveKKM = item.avg >= 75;
                return (
                  <div key={item.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.subject}</span>
                      <span className={`font-bold ${isAboveKKM ? 'text-emerald-800' : 'text-rose-600'}`}>
                        {item.avg} / 100
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, item.avg)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAboveKKM ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Predikat Tertinggi: <strong>PAI & Tahfidz</strong></span>
            <span className="text-emerald-700 font-semibold cursor-pointer" onClick={() => onNavigate('grades')}>
              Input Nilai Baru →
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Distribusi Predikat & Siswa Berprestasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribusi Predikat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <span>🏷️</span>
            <span>Distribusi Predikat Kelulusan</span>
          </h4>
          <p className="text-xs text-slate-500 mb-4">Pengelompokan capaian hasil belajar</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Predikat A</span>
                <span className="text-sm">🌟</span>
              </div>
              <p className="text-xl font-bold text-emerald-900 mt-1">{predicateCounts.A}</p>
              <p className="text-[11px] text-emerald-700">Sangat Baik (≥88)</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800">Predikat B</span>
                <span className="text-sm">👍</span>
              </div>
              <p className="text-xl font-bold text-blue-900 mt-1">{predicateCounts.B}</p>
              <p className="text-[11px] text-blue-700">Baik (78 - 87)</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">Predikat C</span>
                <span className="text-sm">📋</span>
              </div>
              <p className="text-xl font-bold text-amber-900 mt-1">{predicateCounts.C}</p>
              <p className="text-[11px] text-amber-700">Cukup (70 - 77)</p>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">Predikat D</span>
                <span className="text-sm">⚠️</span>
              </div>
              <p className="text-xl font-bold text-rose-900 mt-1">{predicateCounts.D}</p>
              <p className="text-[11px] text-rose-700">Perlu Bimbingan (&lt;70)</p>
            </div>
          </div>
        </div>

        {/* Siswa Berprestasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>🏆</span>
                <span>Peserta Didik Berprestasi</span>
              </h4>
              <p className="text-xs text-slate-500">Rata-rata akumulasi nilai tertinggi semester ini</p>
            </div>
            <button
              onClick={() => onNavigate('grades')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Lihat Seluruh Rapor →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Data siswa belum tersedia.</p>
            ) : (
              topStudents.map((st, idx) => (
                <div key={st.name} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{st.name}</p>
                      <p className="text-xs text-slate-500">Kelas: {st.classRoom}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-sm border border-emerald-200">
                      {st.score}
                    </span>
                    <p className="text-[10px] text-emerald-700 font-medium">Predikat A</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
