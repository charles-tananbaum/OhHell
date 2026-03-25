import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Toast from '../shared/Toast';
import AdminLoginModal from '../auth/AdminLoginModal';

export default function AppShell() {
  return (
    <div className="felt-bg relative min-h-dvh pb-24">
      <div className="page-bg min-h-dvh">
        <main className="mx-auto max-w-lg px-4 pt-6 pb-4">
          <Outlet />
          <AdminLoginModal />
        </main>
      </div>
      <NavBar />
      <Toast />
    </div>
  );
}
