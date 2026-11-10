/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { GradesView } from './components/GradesView';
import { SpmbView } from './components/SpmbView';
import { StudentsView } from './components/StudentsView';
import { TeachersView } from './components/TeachersView';
import { SettingsView } from './components/SettingsView';
import { Student, Teacher, AttendanceRecord, AcademicGrade, UserRole } from './types';
import {
  subscribeToStudents,
  subscribeToTeachers,
  subscribeToAttendance,
  subscribeToGrades,
  seedInitialDataIfEmpty,
} from './firebase';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_ATTENDANCE, INITIAL_GRADES } from './data/initialData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Firestore Real-Time State
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [grades, setGrades] = useState<AcademicGrade[]>(INITIAL_GRADES);

  // Network offline status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check and seed Firestore
    seedInitialDataIfEmpty();

    // Subscribe to Firestore collections
    const unsubStudents = subscribeToStudents((data) => setStudents(data));
    const unsubTeachers = subscribeToTeachers((data) => setTeachers(data));
    const unsubAttendance = subscribeToAttendance((data) => setAttendance(data));
    const unsubGrades = subscribeToGrades((data) => setGrades(data));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubStudents();
      unsubTeachers();
      unsubAttendance();
      unsubGrades();
    };
  }, []);

  const handleSpmbSuccess = (newStudent: Student) => {
    // Immediate optimistic update
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
          <span>⚠️</span>
          <span>Mode Offline — Data tersimpan secara lokal dan akan disinkronkan saat terhubung kembali.</span>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        currentRole={currentRole}
        onChangeRole={(role) => setCurrentRole(role)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
        />

        {/* View Routing with Gentle Transition */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto transition-opacity duration-200">
          {currentTab === 'dashboard' && (
            <DashboardView
              students={students}
              teachers={teachers}
              attendance={attendance}
              grades={grades}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              students={students}
              attendance={attendance}
            />
          )}

          {currentTab === 'grades' && (
            <GradesView
              students={students}
              grades={grades}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'spmb' && (
            <SpmbView
              onSuccessRegistered={handleSpmbSuccess}
              onNavigateToStudents={() => setCurrentTab('students')}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              students={students}
              currentRole={currentRole}
              onNavigateToSpmb={() => setCurrentTab('spmb')}
            />
          )}

          {currentTab === 'teachers' && (
            <TeachersView
              teachers={teachers}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              onChangeRole={(role) => setCurrentRole(role)}
            />
          )}
        </main>
      </div>

      {/* Android Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 py-1 px-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            currentTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📊</span>
          <span>Beranda</span>
        </button>
        <button
          onClick={() => setCurrentTab('attendance')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            currentTab === 'attendance' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📅</span>
          <span>Presensi</span>
        </button>
        <button
          onClick={() => setCurrentTab('spmb')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            currentTab === 'spmb' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📋</span>
          <span>SPMB</span>
        </button>
        <button
          onClick={() => setCurrentTab('grades')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
            currentTab === 'grades' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <span className="text-base">📝</span>
          <span>Nilai</span>
        </button>
        <button
          onClick={() => setIsOpenMobile(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold text-slate-500"
        >
          <span className="text-base">☰</span>
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
}
