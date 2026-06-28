import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';

/** Authenticated shell: sidebar (desktop) + top bar + content + bottom nav (mobile). */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:mr-64">
        <MobileHeader />
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 lg:px-6 lg:pb-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
