import { fetchTennisData } from '../../redux/reducer/tennisSlice';
import SportMatchList from './components/SportMatchList';

export default function Tennis() {
  return (
    <SportMatchList
      sliceKey='tennis'
      fetchAction={fetchTennisData}
      routePrefix='/tennis-bet'
    />
  );
}
