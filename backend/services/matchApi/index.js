
import dotenv from 'dotenv';

import { createProviderA } from './providerA.js';
import { createProviderB } from './providerB.js';
import { createProviderC } from './providerC.js';

dotenv.config();

const PROVIDER = (process.env.API_PROVIDER || 'provider_a')
  .toLowerCase()
  .replace(/\s+/g, '');

console.log('[API PROVIDER] Active provider:', PROVIDER);

let activeProvider;

switch (PROVIDER) {
  case 'providerb':
  case 'provider_b':
    activeProvider = createProviderB();
    break;

  case 'providerc':
  case 'provider_c':
    activeProvider = createProviderC();
    break;

  case 'providera':
  case 'provider_a':
    activeProvider = createProviderA();
    break;

  default:
    console.warn(
      `[API PROVIDER] Unknown provider "${PROVIDER}". Using Provider A.`
    );
    activeProvider = createProviderA();
    break;
}

// Helper: safely call provider methods
const callProvider = (method, ...args) => {
  if (typeof activeProvider?.[method] !== 'function') {
    throw new Error(
      `${method} is not supported by active provider: ${PROVIDER}`
    );
  }

  return activeProvider[method](...args);
};

// Match APIs
export const fetchMatchList = (sportId) =>
  callProvider('fetchMatchList', sportId);

export const fetchMatchData = (gameId, sportId) =>
  callProvider('fetchMatchData', gameId, sportId);

// Result APIs
export const getResult = (payload) =>
  callProvider('getResult', payload);

export const sendBetIncoming = (payload) =>
  callProvider('sendBetIncoming', payload);

// Casino APIs
export const fetchCasinoTables = () =>
  callProvider('fetchCasinoTables');

export const fetchCasinoData = (eventName) =>
  callProvider('fetchCasinoData', eventName);

export const fetchCasinoResult = (eventName) =>
  callProvider('fetchCasinoResult', eventName);

export const fetchDirectCasinoResultByDate = (date, eventName) =>
  callProvider('fetchDirectCasinoResultByDate', date, eventName);

export const fetchCasinoDetailResult = (gtype, mid) =>
  callProvider('fetchCasinoDetailResult', gtype, mid);

// Cricket APIs
export const fetchCricketFancyResult = (eventId, fancyId) =>
  callProvider('fetchCricketFancyResult', eventId, fancyId);

export const fetchCricketFancyByEvent = (eventId) =>
  callProvider('fetchCricketFancyByEvent', eventId);

export const fetchStFancyByEvent = (eventId) =>
  callProvider('fetchStFancyByEvent', eventId);

// Other APIs
export const fetchScore = (gmid, sid) =>
  callProvider('fetchScore', gmid, sid);

export const fetchAllIframes = (gmid) =>
  callProvider('fetchAllIframes', gmid);

// Provider information
export const getProviderName = () => PROVIDER;

export default activeProvider;
