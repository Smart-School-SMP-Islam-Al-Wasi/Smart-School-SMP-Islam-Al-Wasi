import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenMobileSidebar }) => {
  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard Perkembangan', desc: 'Pemantauan komprehensif kehadiran & capaian belajar' };
      case 'attendance':
        return { title: 'Presensi Real-Time', desc: 'Pencatatan dan monitoring kehadiran harian peserta didik' };
      case 'grades':
        return { title: 'Nilai Akademik', desc: 'Pengelolaan nilai tugas, ujian, dan rekap capaian KKM' };
      case 'spmb':
        return { title: 'SPMB (Pendaftaran Siswa Baru)', desc: 'Pengisian biodata calon siswa langsung ke database' };
      case 'students':
        return { title: 'Data Peserta Didik', desc: 'Direktori seluruh siswa terdaftar hasil SPMB' };
      case 'teachers':
        return { title: 'Dewan Guru & Pendidik', desc: 'Manajemen data guru dan tenaga kependidikan oleh Admin' };
      case 'settings':
        return { title: 'Pengaturan & Profil', desc: 'Informasi institusi dan panduan build APK Capacitor' };
    }
  };

  const pageInfo = getPageTitle(currentTab);

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Buka Menu"
        >
          <span className="text-xl">☰</span>
        </button>

        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            {pageInfo.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {pageInfo.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Indonesian Date Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <span>📅</span>
          <span>{todayStr}</span>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton />
      </div>
    </header>
  );
};
