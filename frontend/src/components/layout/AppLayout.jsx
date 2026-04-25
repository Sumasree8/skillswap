import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout = () => (
  <div className="min-h-dvh flex flex-col bg-surface-0">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);
