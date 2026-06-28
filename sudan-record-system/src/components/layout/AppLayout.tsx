import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

/** Shell for authenticated pages: top bar + scrollable content + bottom nav. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
