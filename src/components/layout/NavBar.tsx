import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spade, Users, Trophy, BarChart3, Medal } from 'lucide-react';

const tabs = [
  { to: '/', icon: Spade, label: 'Games' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/leaderboard', icon: Trophy, label: 'Rankings' },
  { to: '/sabermetrics', icon: BarChart3, label: 'Stats' },
  { to: '/trophies', icon: Medal, label: 'Trophies' },
];

export default function NavBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/games');
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-1 rounded-full glass-strong px-2 py-1.5 shadow-2xl shadow-black/40">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex items-center gap-1.5 px-3 py-2"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full gradient-accent"
                  style={{ opacity: 0.15 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon
                size={16}
                strokeWidth={active ? 2.4 : 1.6}
                className={`relative z-10 transition-colors duration-200 ${
                  active ? 'text-accent' : 'text-text-muted'
                }`}
              />
              {active && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative z-10 overflow-hidden whitespace-nowrap text-xs font-bold text-accent"
                >
                  {label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
