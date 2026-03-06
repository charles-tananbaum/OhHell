import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Toast from '../shared/Toast';

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-[#09090b] page-bg">
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <Outlet />
      </main>
      <NavBar />
      <Toast />
    </div>
  );
}
