import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spade, Users, Trophy, BarChart3 } from 'lucide-react';

const tabs = [
  { to: '/', icon: Spade, label: 'Games' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/leaderboard', icon: Trophy, label: 'Rankings' },
  { to: '/sabermetrics', icon: BarChart3, label: 'Stats' },
];

export default function NavBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/games');
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="glass-strong border-t border-separator-strong">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          {tabs.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="relative flex flex-col items-center gap-0.5 px-5 py-2"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(145deg, rgba(45, 122, 79, 0.12), rgba(45, 122, 79, 0.04))',
                      border: '1px solid rgba(45, 122, 79, 0.18)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.5}
                  className={`relative z-10 transition-colors duration-200 ${
                    active ? 'text-accent-light' : 'text-text-muted'
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                    active ? 'text-accent-light' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
