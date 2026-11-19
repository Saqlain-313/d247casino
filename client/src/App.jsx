import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './redux/PrivateRoute';

// Route-level code splitting: heavy sports/casino/report pages load on demand
const Login = lazy(() => import('./pages/auth/Login'));
const Home = lazy(() => import('./pages/Home/Home'));
const Cricket = lazy(() => import('./pages/Home/Cricket'));
const Football = lazy(() => import('./pages/Home/Football'));
const Tennis = lazy(() => import('./pages/Home/Tennis'));
const CasinoList = lazy(() => import('./pages/Home/ourcasino/CasinoList'));
const OurPremCasino = lazy(
  () => import('./pages/Home/ourpremcasino/CasinoList')
);
const OurVipCasino = lazy(() => import('./pages/Home/ourvipcasino/CasinoList'));
const OurVirtualCasino = lazy(
  () => import('./pages/Home/ourvirtual/CasinoList')
);
const CasinoBet = lazy(() => import('./pages/CasinoBet/casinoBet'));
const CricketBet = lazy(() => import('./pages/gamedetails/CricketBet'));
const ECricketBet = lazy(() => import('./pages/gamedetails/ECricketBet'));
const FootballBet = lazy(() => import('./pages/gamedetails/FootballBet'));
const HourseRacingBet = lazy(
  () => import('./pages/gamedetails/HourseRacingBet')
);
const TennisBet = lazy(() => import('./pages/gamedetails/TennisBet'));
const AccountStatement = lazy(() => import('./pages/other/AccountStatement'));
const ActivityLog = lazy(() => import('./pages/other/ActivityLog'));
const CasinoResults = lazy(() => import('./pages/other/CasinoResults'));
const ChangePassword = lazy(() => import('./pages/other/ChangePassword'));
const CurrentBets = lazy(() => import('./pages/other/CurrentBets'));

function RouteLoader() {
  return (
    <div className='flex min-h-[200px] w-full items-center justify-center text-sm text-gray-500'>
      Loading...
    </div>
  );
}

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

// D247-style event URLs (/game-detail/:etId/:id, e.g. /game-detail/4/857488570)
// map cleanly to our sport detail routes.
function GameDetailRedirect() {
  const { etId, id } = useParams();
  const code = Number(etId);
  if (code === 4) return <Navigate to={`/cricket-bet/${id}`} replace />;
  if (code === 1) return <Navigate to={`/football-bet/${id}`} replace />;
  if (code === 2) return <Navigate to={`/tennis-bet/${id}`} replace />;
  if (code === 10 || code === 65) {
    return <Navigate to={`/hourse-racing-bet/${id}`} replace />;
  }
  return <Navigate to='/' replace />;
}

function App() {
  return (
    <>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path='cricket' element={<Cricket />} />
              <Route path='football' element={<Football />} />
              <Route path='tennis' element={<Tennis />} />
              <Route path='/casino/:gameid' element={<CasinoBet />} />
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
              <Route
                path='hourse-racing-bet/:id'
                element={<HourseRacingBet />}
              />
              <Route
                path='game-detail/:etId/:id'
                element={<GameDetailRedirect />}
              />
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
              <Route
                path='casino/:match/:gameid'
                element={<LegacyCasinoRedirect />}
              />
              <Route path='account-statement' element={<AccountStatement />} />
              <Route path='current-bets' element={<CurrentBets />} />
              <Route path='activity-log' element={<ActivityLog />} />
              <Route path='change-password' element={<ChangePassword />} />
              <Route path='casino-results' element={<CasinoResults />} />
              <Route path='casino-list' element={<CasinoList />} />
              <Route path='casino-list/:category' element={<CasinoList />} />
              <Route
                path='casino-list/:provider/:tabId'
                element={<CasinoList />}
              />
              <Route
                path='casino-list/:provider/:tabId/:subTabId'
                element={<CasinoList />}
              />
              <Route path='our-vip-casino' element={<OurVipCasino />} />
              <Route path='our-virtual-casino' element={<OurVirtualCasino />} />
              <Route path='our-prem-casino' element={<OurPremCasino />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
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
