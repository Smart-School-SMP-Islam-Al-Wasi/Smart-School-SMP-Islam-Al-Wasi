export type ClassRoom = '7A' | '7B' | '8A' | '8B' | '9A' | '9B';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export type UserRole = 'admin' | 'guru' | 'wali_murid';

export interface Student {
  id: string;
  nisn: string;
  fullName: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string;
  classRoom: ClassRoom;
  parentName: string;
  parentPhone: string;
  previousSchool: string;
  status: 'Aktif' | 'Baru' | 'Alumni';
  registrationDate: string;
  notes?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  fullName: string;
  subject: string;
  phone: string;
  email?: string;
  status: 'Aktif' | 'Cuti';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: ClassRoom;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  time: string; // HH:mm
  note?: string;
}

export interface AcademicGrade {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: ClassRoom;
  subject: string;
  semester: string;
  assignment: number;
  midExam: number;
  finalExam: number;
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  teacherName: string;
  updatedAt: string;
}

export interface SchoolProfile {
  schoolName: string;
  npsn: string;
  principal: string;
  academicYear: string;
  address: string;
  phone: string;
  email: string;
}
