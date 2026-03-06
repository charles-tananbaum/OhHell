import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginGate from './components/auth/LoginGate';
import AppShell from './components/layout/AppShell';

const GameList = lazy(() => import('./components/game/GameList'));
const NewGame = lazy(() => import('./components/game/NewGame'));
const ActiveGame = lazy(() => import('./components/game/ActiveGame'));
const GameComplete = lazy(() => import('./components/game/GameComplete'));
const GameReview = lazy(() => import('./components/game/GameReview'));
const PlayerList = lazy(() => import('./components/players/PlayerList'));
const PlayerDetail = lazy(() => import('./components/players/PlayerDetail'));
const Leaderboard = lazy(() => import('./components/leaderboard/Leaderboard'));
const Sabermetrics = lazy(() => import('./components/sabermetrics/Sabermetrics'));

function RouteLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/30 border-t-accent-light" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LoginGate>
        <AnimatePresence mode="wait">
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Suspense fallback={<RouteLoader />}><GameList /></Suspense>} />
              <Route path="/games/new" element={<Suspense fallback={<RouteLoader />}><NewGame /></Suspense>} />
              <Route path="/games/:id" element={<Suspense fallback={<RouteLoader />}><ActiveGame /></Suspense>} />
              <Route path="/games/:id/complete" element={<Suspense fallback={<RouteLoader />}><GameComplete /></Suspense>} />
              <Route path="/games/:id/review" element={<Suspense fallback={<RouteLoader />}><GameReview /></Suspense>} />
              <Route path="/players" element={<Suspense fallback={<RouteLoader />}><PlayerList /></Suspense>} />
              <Route path="/players/:id" element={<Suspense fallback={<RouteLoader />}><PlayerDetail /></Suspense>} />
              <Route path="/leaderboard" element={<Suspense fallback={<RouteLoader />}><Leaderboard /></Suspense>} />
              <Route path="/sabermetrics" element={<Suspense fallback={<RouteLoader />}><Sabermetrics /></Suspense>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </LoginGate>
    </BrowserRouter>
  );
}
