import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Student, Teacher, AttendanceRecord, AcademicGrade, SchoolProfile } from './types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_ATTENDANCE, INITIAL_GRADES, INITIAL_SCHOOL_PROFILE } from './data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
  return errInfo;
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'school_settings', 'profile'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firebase running with local cache/offline persistence.');
    }
  }
}
testConnection();

// Initial database seeding if empty
export async function seedInitialDataIfEmpty() {
  try {
    const studentSnapshot = await getDocs(collection(db, 'students'));
    if (studentSnapshot.empty) {
      console.info('Seeding initial data for SMP Islam Al-Wasi\'...');
      for (const student of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'students', student.id), student);
      }
      for (const teacher of INITIAL_TEACHERS) {
        await setDoc(doc(db, 'teachers', teacher.id), teacher);
      }
      for (const att of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, 'attendance', att.id), att);
      }
      for (const grade of INITIAL_GRADES) {
        await setDoc(doc(db, 'grades', grade.id), grade);
      }
      await setDoc(doc(db, 'school_settings', 'profile'), INITIAL_SCHOOL_PROFILE);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seeding');
  }
}

// Student CRUD
export async function addStudent(studentData: Omit<Student, 'id'>): Promise<string> {
  const newId = `std-${Date.now()}`;
  const student: Student = { ...studentData, id: newId };
  try {
    await setDoc(doc(db, 'students', newId), student);
    return newId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `students/${newId}`);
    throw err;
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
    throw err;
  }
}

// Teacher CRUD
export async function addTeacher(teacherData: Omit<Teacher, 'id'>): Promise<string> {
  const newId = `tch-${Date.now()}`;
  const teacher: Teacher = { ...teacherData, id: newId };
  try {
    await setDoc(doc(db, 'teachers', newId), teacher);
    return newId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `teachers/${newId}`);
    throw err;
  }
}

export async function deleteTeacher(teacherId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'teachers', teacherId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `teachers/${teacherId}`);
    throw err;
  }
}

// Attendance CRUD
export async function recordAttendance(record: AttendanceRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'attendance', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendance/${record.id}`);
    throw err;
  }
}

export async function batchRecordAttendance(records: AttendanceRecord[]): Promise<void> {
  try {
    for (const record of records) {
      await setDoc(doc(db, 'attendance', record.id), record);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'attendance/batch');
    throw err;
  }
}

// Grades CRUD
export async function recordGrade(grade: AcademicGrade): Promise<void> {
  try {
    await setDoc(doc(db, 'grades', grade.id), grade);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `grades/${grade.id}`);
    throw err;
  }
}

export async function deleteGrade(gradeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'grades', gradeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `grades/${gradeId}`);
    throw err;
  }
}

// Subscriptions
export function subscribeToStudents(callback: (students: Student[]) => void): Unsubscribe {
  const path = 'students';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_STUDENTS);
      } else {
        const list = snapshot.docs.map((d) => d.data() as Student);
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(INITIAL_STUDENTS);
    }
  );
}

export function subscribeToTeachers(callback: (teachers: Teacher[]) => void): Unsubscribe {
  const path = 'teachers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_TEACHERS);
      } else {
        const list = snapshot.docs.map((d) => d.data() as Teacher);
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(INITIAL_TEACHERS);
    }
  );
}

export function subscribeToAttendance(callback: (records: AttendanceRecord[]) => void): Unsubscribe {
  const path = 'attendance';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_ATTENDANCE);
      } else {
        const list = snapshot.docs.map((d) => d.data() as AttendanceRecord);
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(INITIAL_ATTENDANCE);
    }
  );
}

export function subscribeToGrades(callback: (grades: AcademicGrade[]) => void): Unsubscribe {
  const path = 'grades';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        callback(INITIAL_GRADES);
      } else {
        const list = snapshot.docs.map((d) => d.data() as AcademicGrade);
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      callback(INITIAL_GRADES);
    }
  );
}
