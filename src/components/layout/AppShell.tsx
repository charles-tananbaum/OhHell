import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Toast from '../shared/Toast';

export default function AppShell() {
  return (
    <div className="felt-bg relative min-h-dvh pb-20">
      <div className="page-bg min-h-dvh">
        <main className="mx-auto max-w-lg px-4 pt-6 pb-4">
          <Outlet />
        </main>
      </div>
      <NavBar />
      <Toast />
    </div>
  );
}
