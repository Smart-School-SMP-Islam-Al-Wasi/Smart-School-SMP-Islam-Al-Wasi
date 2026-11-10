import React from 'react';
import { UserRole } from '../types';

export type NavTab = 'dashboard' | 'attendance' | 'grades' | 'spmb' | 'students' | 'teachers' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  currentRole,
  onChangeRole,
}) => {
  const menuItems: { id: NavTab; label: string; emoji: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Perkembangan', emoji: '📊' },
    { id: 'attendance', label: 'Presensi Real-Time', emoji: '📅' },
    { id: 'grades', label: 'Nilai Akademik', emoji: '📝' },
    { id: 'spmb', label: 'SPMB (Daftar Siswa Baru)', emoji: '📋', badge: 'Baru' },
    { id: 'students', label: 'Data Peserta Didik', emoji: '👩‍🎓' },
    { id: 'teachers', label: 'Dewan Guru & Staf', emoji: '👨‍🏫' },
    { id: 'settings', label: 'Pengaturan & Profil', emoji: '⚙️' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & School Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center text-2xl text-white shadow-xs">
                <span>🏫</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                  SMP Islam Al-Wasi'
                </h1>
                <p className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                  Smart School PWA
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Tutup Menu"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Quick Role Selector */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 font-medium">Mode Akses:</span>
              <span className="text-emerald-700 font-bold uppercase text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-50">
                {currentRole}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => onChangeRole('admin')}
                className={`py-1 text-xs rounded-md font-medium transition ${
                  currentRole === 'admin'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => onChangeRole('guru')}
                className={`py-1 text-xs rounded-md font-medium transition ${
                  currentRole === 'guru'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Guru
              </button>
              <button
                type="button"
                onClick={() => onChangeRole('wali_murid')}
                className={`py-1 text-xs rounded-md font-medium transition ${
                  currentRole === 'wali_murid'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wali
              </button>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-700 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-300">
              <span>{currentRole === 'admin' ? '👑' : currentRole === 'guru' ? '👨‍🏫' : '👨‍👩‍👧'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {currentRole === 'admin'
                  ? 'Administrator Utama'
                  : currentRole === 'guru'
                  ? 'Dewan Pendidik'
                  : 'Orang Tua / Siswa'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore Terhubung</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
