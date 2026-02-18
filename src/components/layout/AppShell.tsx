import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Toast from '../shared/Toast';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <main className="mx-auto max-w-lg px-4 pb-8 pt-16">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
