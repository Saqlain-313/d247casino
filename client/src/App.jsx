import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MainLayout from './layouts/MainLayout';
import CasinoBet from './pages/CasinoBet/casinoBet';
import Cricket from './pages/Home/Cricket';
import Football from './pages/Home/Football';
import Home from './pages/Home/Home';
import Tennis from './pages/Home/Tennis';
import CasinoList from './pages/Home/ourcasino/CasinoList';
import OurPremCasino from './pages/Home/ourpremcasino/CasinoList';
import OurVipCasino from './pages/Home/ourvipcasino/CasinoList';
import OurVirtualCasino from './pages/Home/ourvirtual/CasinoList';
import Login from './pages/auth/Login';
import CricketBet from './pages/gamedetails/CricketBet';
import ECricketBet from './pages/gamedetails/ECricketBet';
import FootballBet from './pages/gamedetails/FootballBet';
import HourseRacingBet from './pages/gamedetails/HourseRacingBet';
import TennisBet from './pages/gamedetails/TennisBet';
import AccountStatement from './pages/other/AccountStatement';
import ActivityLog from './pages/other/ActivityLog';
import CasinoResults from './pages/other/CasinoResults';
import ChangePassword from './pages/other/ChangePassword';
import CurrentBets from './pages/other/CurrentBets';
import PrivateRoute from './redux/PrivateRoute';

// Old 2-segment URLs (/cricket-bet/<name>/<id>, /casino-bet/<name>/<slug>)
// still live in bookmarks, history and shared links — redirect them to the
// ID-only routes, carrying the display name through router state.
function LegacyBetRedirect({ base }) {
  const { game, id } = useParams();
  return <Navigate to={`/${base}/${id}`} state={{ name: game }} replace />;
}

function LegacyCasinoRedirect() {
  const { gameid } = useParams();
  return <Navigate to={`/casino-bet/${gameid}`} replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path='cricket' element={<Cricket />} />
            <Route path='football' element={<Football />} />
            <Route path='tennis' element={<Tennis />} />
            <Route path='/casino-bet/:gameid' element={<CasinoBet />} />
            <Route path='cricket-bet/:id' element={<CricketBet />} />
            {/* iscc-based dedicated casino game pages (reference routing) */}
            <Route
              path='cricketv/:id'
              element={<CricketBet variant='cricketv' />}
            />
            <Route
              path='virtual-cricket/:id'
              element={<CricketBet variant='virtual' />}
            />
            <Route
              path='superover/:id'
              element={<CricketBet variant='superover' />}
            />
            <Route path='e-games/:id' element={<ECricketBet />} />
            <Route path='football-bet/:id' element={<FootballBet />} />
            <Route path='tennis-bet/:id' element={<TennisBet />} />
            <Route path='hourse-racing-bet/:id' element={<HourseRacingBet />} />
            {/* legacy 2-segment URLs → ID-only routes */}
            <Route
              path='cricket-bet/:game/:id'
              element={<LegacyBetRedirect base='cricket-bet' />}
            />
            <Route
              path='football-bet/:game/:id'
              element={<LegacyBetRedirect base='football-bet' />}
            />
            <Route
              path='tennis-bet/:game/:id'
              element={<LegacyBetRedirect base='tennis-bet' />}
            />
            <Route
              path='hourse-racing-bet/:game/:id'
              element={<LegacyBetRedirect base='hourse-racing-bet' />}
            />
            <Route
              path='casino-bet/:match/:gameid'
              element={<LegacyCasinoRedirect />}
            />
            <Route path='account-statement' element={<AccountStatement />} />
            <Route path='current-bets' element={<CurrentBets />} />
            <Route path='activity-log' element={<ActivityLog />} />
            <Route path='change-password' element={<ChangePassword />} />
            <Route path='casino-results' element={<CasinoResults />} />
            <Route path='casino-list' element={<CasinoList />} />
            <Route path='casino-list/:category' element={<CasinoList />} />
            <Route path='our-vip-casino' element={<OurVipCasino />} />
            <Route path='our-virtual-casino' element={<OurVirtualCasino />} />
            <Route path='our-prem-casino' element={<OurPremCasino />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        position='top-right'
        autoClose={800}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
    </>
  );
}

export default App;
