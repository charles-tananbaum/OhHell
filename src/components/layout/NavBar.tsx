import { NavLink, useLocation } from 'react-router-dom';
import { Gamepad2, Users, Trophy } from 'lucide-react';
import { clsx } from 'clsx';

const links = [
  { to: '/', icon: Gamepad2, label: 'Games' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-separator bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-4">
        <span className="text-sm font-semibold tracking-wide text-text-secondary">
          Oh Hell
        </span>
        <div className="flex gap-1">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/' ||
                  location.pathname.startsWith('/games')
                : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:text-white',
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
