import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, ClassRoom } from '../types';
import { recordAttendance, batchRecordAttendance } from '../firebase';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState<ClassRoom>('7A');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Filter students for the selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classRoom === selectedClass);
  }, [students, selectedClass]);

  // Attendance map for this date
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const record of attendance) {
      if (record.date === selectedDate) {
        map.set(record.studentId, record);
      }
    }
    return map;
  }, [attendance, selectedDate]);

  // Class stats for this date
  const stats = useMemo(() => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;
    let belum = 0;

    for (const student of classStudents) {
      const rec = attendanceMap.get(student.id);
      if (!rec) {
        belum++;
      } else if (rec.status === 'Hadir') {
        hadir++;
      } else if (rec.status === 'Izin') {
        izin++;
      } else if (rec.status === 'Sakit') {
        sakit++;
      } else if (rec.status === 'Alpa') {
        alpa++;
      }
    }

    const total = classStudents.length || 1;
    const rate = Math.round((hadir / total) * 100);

    return { hadir, izin, sakit, alpa, belum, total: classStudents.length, rate };
  }, [classStudents, attendanceMap]);

  // Status Change Handler
  const handleStatusChange = async (student: Student, newStatus: AttendanceStatus) => {
    setSavingId(student.id);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const existing = attendanceMap.get(student.id);

    const record: AttendanceRecord = {
      id: existing ? existing.id : `att-${student.id}-${selectedDate}`,
      studentId: student.id,
      studentName: student.fullName,
      classRoom: student.classRoom,
      date: selectedDate,
      status: newStatus,
      time: existing ? existing.time : timeStr,
      note: existing?.note || '',
    };

    try {
      await recordAttendance(record);
    } catch (err) {
      console.error('Failed to record attendance', err);
    } finally {
      setSavingId(null);
    }
  };

  // Mark all students present in one click
  const handleMarkAllPresent = async () => {
    if (classStudents.length === 0) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const records: AttendanceRecord[] = classStudents.map((st) => {
      const existing = attendanceMap.get(st.id);
      return {
        id: existing ? existing.id : `att-${st.id}-${selectedDate}`,
        studentId: st.id,
        studentName: st.fullName,
        classRoom: st.classRoom,
        date: selectedDate,
        status: 'Hadir',
        time: existing?.time || timeStr,
        note: existing?.note || '',
      };
    });

    try {
      await batchRecordAttendance(records);
    } catch (e) {
      console.error('Error marking all present', e);
    }
  };

  const handleSaveNote = async (studentId: string) => {
    const existing = attendanceMap.get(studentId);
    if (!existing) return;
    const updated: AttendanceRecord = {
      ...existing,
      note: tempNote,
    };
    try {
      await recordAttendance(updated);
    } catch (e) {
      console.error('Error saving note', e);
    } finally {
      setEditingNoteId(null);
      setTempNote('');
    }
  };

  const classOptions: ClassRoom[] = ['7A', '7B', '8A', '8B', '9A', '9B'];

  return (
    <div className="space-y-5">
      {/* Control Bar: Class, Date, Batch Action */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📅</span>
              <span>Presensi Harian Real-Time</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan langsung tersinkronisasi otomatis dengan Firestore.
            </p>
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>✅</span>
            <span>Tandai Semua Hadir</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Class Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Pilih Rombel / Kelas
            </label>
            <div className="flex items-center gap-1 overflow-x-auto">
              {classOptions.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedClass === cls
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Tanggal Presensi
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
              />
              {selectedDate !== todayStr && (
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap"
                >
                  Hari Ini
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Filter Tampilan
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:bg-white"
            >
              <option value="SEMUA">Semua Status Siswa</option>
              <option value="Hadir">Hanya Hadir</option>
              <option value="Izin">Hanya Izin</option>
              <option value="Sakit">Hanya Sakit</option>
              <option value="Alpa">Hanya Alpa</option>
              <option value="BELUM">Belum Tercatat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Class Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <span>🟢</span> Hadir
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.hadir}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
            <span>🟡</span> Izin
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.izin}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
            <span>🔵</span> Sakit
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.sakit}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
            <span>🔴</span> Alpa
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.alpa}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
            <span>⚪</span> Belum Input
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.belum}</p>
        </div>
      </div>

      {/* Students Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {classStudents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <span className="text-3xl">👥</span>
            <p className="text-sm font-semibold text-slate-700">Belum ada siswa di kelas {selectedClass}.</p>
            <p className="text-xs text-slate-500">Silakan daftarkan siswa ke kelas ini lewat halaman SPMB.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NISN</th>
                  <th className="py-3 px-4 text-center">Status Kehadiran Hari Ini</th>
                  <th className="py-3 px-4">Waktu Check-In</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {classStudents
                  .filter((st) => {
                    if (filterStatus === 'SEMUA') return true;
                    const rec = attendanceMap.get(st.id);
                    if (filterStatus === 'BELUM') return !rec;
                    return rec?.status === filterStatus;
                  })
                  .map((st) => {
                    const record = attendanceMap.get(st.id);
                    const currentStatus = record?.status;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{st.fullName}</p>
                          <p className="text-[11px] text-slate-500">{st.parentName} ({st.parentPhone})</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">
                          {st.nisn}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(st, 'Hadir')}
                              disabled={savingId === st.id}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'Hadir'
                                  ? 'bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              onClick={() => handleStatusChange(st, 'Izin')}
                              disabled={savingId === st.id}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'Izin'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-amber-50 text-slate-700'
                              }`}
                            >
                              Izin
                            </button>
                            <button
                              onClick={() => handleStatusChange(st, 'Sakit')}
                              disabled={savingId === st.id}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'Sakit'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700'
                              }`}
                            >
                              Sakit
                            </button>
                            <button
                              onClick={() => handleStatusChange(st, 'Alpa')}
                              disabled={savingId === st.id}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                currentStatus === 'Alpa'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-rose-50 text-slate-700'
                              }`}
                            >
                              Alpa
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {record ? record.time : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {editingNoteId === st.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Alasan izin / sakit..."
                                className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
                              />
                              <button
                                onClick={() => handleSaveNote(st.id)}
                                className="px-2 py-1 bg-emerald-700 text-white rounded-lg text-xs"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 italic">
                                {record?.note || '-'}
                              </span>
                              {record && (
                                <button
                                  onClick={() => {
                                    setEditingNoteId(st.id);
                                    setTempNote(record.note || '');
                                  }}
                                  className="text-slate-400 hover:text-slate-700 text-xs"
                                  title="Edit catatan"
                                >
                                  ✏️
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
