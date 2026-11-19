import { fetchSoccerData } from '../../redux/reducer/soccerSlice';
import SportMatchList from './components/SportMatchList';

export default function Football() {
  return (
    <SportMatchList
      sliceKey='soccer'
      fetchAction={fetchSoccerData}
      routePrefix='/football-bet'
    />
  );
}
