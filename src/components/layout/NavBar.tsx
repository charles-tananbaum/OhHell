import { NavLink, useLocation } from 'react-router-dom';
import { Gamepad2, Users, Trophy, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const links = [
  { to: '/', icon: Gamepad2, label: 'Games' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/leaderboard', icon: Trophy, label: 'Board' },
  { to: '/sabermetrics', icon: BarChart3, label: 'Stats' },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-black/80 backdrop-blur-xl safe-area-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
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
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[1px] left-2 right-2 h-[2px] rounded-full gradient-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={20}
                className={clsx(
                  'transition-colors',
                  isActive ? 'text-accent-light' : 'text-text-secondary',
                )}
              />
              <span
                className={clsx(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-accent-light' : 'text-text-secondary',
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
