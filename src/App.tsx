import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoginGate from './components/auth/LoginGate';
import AppShell from './components/layout/AppShell';
import GameList from './components/game/GameList';
import NewGame from './components/game/NewGame';
import ActiveGame from './components/game/ActiveGame';
import GameComplete from './components/game/GameComplete';
import GameReview from './components/game/GameReview';
import PlayerList from './components/players/PlayerList';
import PlayerDetail from './components/players/PlayerDetail';
import Leaderboard from './components/leaderboard/Leaderboard';
import Sabermetrics from './components/sabermetrics/Sabermetrics';

export default function App() {
  return (
    <BrowserRouter>
      <LoginGate>
        <AnimatePresence mode="wait">
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<GameList />} />
              <Route path="/games/new" element={<NewGame />} />
              <Route path="/games/:id" element={<ActiveGame />} />
              <Route path="/games/:id/complete" element={<GameComplete />} />
              <Route path="/games/:id/review" element={<GameReview />} />
              <Route path="/players" element={<PlayerList />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/sabermetrics" element={<Sabermetrics />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </LoginGate>
    </BrowserRouter>
  );
}
