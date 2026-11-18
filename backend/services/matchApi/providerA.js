import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export function createProviderA() {
  const API_URL = process.env.API_URL;
  const API_KEY = process.env.API_KEY;
  const RESULT_API_URL = process.env.RESULT_API_URL;

  // Matka bazaar round-based feed (worli3 only): base /tabdata/worli3 = rounds list,
  // markets /data/worli3_<mid>. worli & worli2 use standard /data/<slug> + /sections/<slug>.
  const ROUND_BASED_SLUGS = new Set(['worli3']);
  const MATKA_SLUGS = new Set(['worli', 'worli2', 'worli3']);
  const MATKA_SPECIAL = { 11: 'Line 1', 12: 'Line 2', 13: 'ODD', 14: 'EVEN' };
  const sectionsCache = new Map(); // slug -> { at, value }

  // sub entries me nat label + back rate (sections board se) merge karo —
  // bet slip aur placement dono provider market ke nat/b par depend karte hy.
  const augmentMatkaSub = (sub, sections) => {
    const board = sections?.['1']?.Table?.[0] || null;
    return (Array.isArray(sub) ? sub : []).map((m) => {
      const sid = Number(m.sid);
      const nat = m.nat ?? MATKA_SPECIAL[sid] ?? String(Number(m.sr) % 10);
      const rate = sid >= 1 && sid <= 10 ? board?.single : board?.multi;
      return {
        ...m,
        nat,
        b:
          m.b ??
          (Number.isFinite(Number(rate)) && Number(rate) > 1
            ? Number(rate)
            : 0),
      };
    });
  };

  const fetchSections = async (slug) => {
    const hit = sectionsCache.get(slug);
    if (hit && Date.now() - hit.at <= 5000) return hit.value;
    try {
      const r = await axios.get(
        `${API_URL}/diamond/direct-casino/sections/${encodeURIComponent(slug)}?key=${API_KEY}`,
        { timeout: 8000 }
      );
      const value = r.data?.data ?? {};
      sectionsCache.set(slug, { at: Date.now(), value });
      return value;
    } catch {
      return hit?.value ?? {};
    }
  };

  const fetchRoundBasedCasinoData = async (slug) => {
    let tab;
    try {
      tab = await axios.get(
        `${API_URL}/diamond/direct-casino/tabdata/${encodeURIComponent(slug)}?key=${API_KEY}`,
        { timeout: 10000 }
      );
    } catch (e) {
      // 404 = gateway pe is game ka poller abhi subscribed nahi (idle/unknown),
      // outage nahi — page ko "no market" dikhao, error banner nahi.
      if (e.response?.status === 404) {
        return { success: false, data: null, rounds: [] };
      }
      throw e;
    }
    // rounds array body.data.data me nested hy (spec + live probe)
    const rounds = Array.isArray(tab.data?.data?.data)
      ? tab.data.data.data
      : [];
    const open = rounds.filter((r) => r.mtype === 'OPEN');
    const active = open.slice(0, 6);
    if (!active.length) {
      return { success: false, data: null, rounds };
    }
    const names = active.map((r) => `${slug}_${r.mid}`).join(',');
    const res = await axios.get(
      `${API_URL}/diamond/direct-casino/data/${names}?key=${API_KEY}`,
      { timeout: 10000 }
    );
    const envelopes = Array.isArray(res.data) ? res.data : [res.data];
    const subs = {};
    let first = null;
    for (const env of envelopes) {
      const d = env?.data?.data;
      if (!d || !d.mid) continue;
      subs[String(d.mid)] = d;
      if (!first) first = d;
    }
    if (!first) return { success: false, data: null, rounds };
    const sections = await fetchSections(slug);
    const augSubs = {};
    for (const [k, d] of Object.entries(subs)) {
      augSubs[k] = { ...d, sub: augmentMatkaSub(d.sub, sections) };
    }
    const firstAug = augSubs[String(first.mid)] || first;
    return {
      success: true,
      data: {
        mid: first.mid,
        gtype: slug,
        mname: first.mname,
        card: first.card ?? '',
        remark: first.remark ?? '',
        grp: first.grp,
        sub: Array.isArray(firstAug.sub) ? firstAug.sub : [],
        rounds: rounds.map((r) => ({
          mid: r.mid,
          mname: r.mname,
          ptime: r.ptime,
          mtime: r.mtime,
          mtype: r.mtype,
          gno: r.gno,
        })),
        subs: augSubs,
        sections,
      },
    };
  };

  // console.log("API_URL********", API_URL)
  // console.log("API_KEY**********", API_KEY)
  // console.log("RESULT_API_URL********", RESULT_API_URL)
  // /diamond/events

  return {
    name: 'providerA',

    // async fetchMatchList(sportId) {
    //   const response = await axios.get(
    //     `${API_URL}/esid?sid=${sportId}&key=${API_KEY}`
    //   );
    //   return response.data;
    // },
    async fetchMatchList(sportId) {
      const response = await axios.get(`${API_URL}/diamond/events/${sportId}`, {
        headers: {
          'X-API-Key': API_KEY,
        },
      });

      return response.data.data;
    },

    // async fetchMatchData(eventName, sportId) {
    //   const response = await axios.get(
    //     `${API_URL}/getPriveteData?key=${API_KEY}&gmid=${eventName}&sid=${sportId}`
    //   );
    //   return response.data;
    // },
    async fetchMatchData(eventName, sportId) {
      const response = await axios.get(
        `${API_URL}/diamond/odds/${sportId}_${eventName}`,
        {
          headers: {
            'X-API-Key': API_KEY,
          },
        }
      );

      // console.log('Provider A Fetch Match Data Response******', response.data.data)
      return response.data.data;
    },

    // async getResult(payload) {
    //   const response = await axios.post(
    //     `${RESULT_API_URL}/get-result?key=${API_KEY}`,
    //     { ...payload, api_key: API_KEY },
    //     { headers: { 'Content-Type': 'application/json' } }
    //   );
    //   return response.data;
    // },
    async getResult(payload) {
      const response = await axios.post(
        `${RESULT_API_URL}/all-results?key=${API_KEY}`,
        { ...payload, api_key: API_KEY },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },

    async sendBetIncoming(payload = {}) {
      // Provider A consumes a slimmer payload than Provider B.
      // Strip fields Provider A's API does not accept
      // (fancymid, bevent_id/beventId, runners, fancyId) and ensure
      // market_id is always present in the outgoing body.
      // Note: doing this here keeps the betController call sites
      // provider-agnostic — Provider B's own whitelist in
      // providerB.sendBetIncoming is not affected by these strips.
      const {
        fancymid: _fancymid,
        bevent_id: _bevent_id,
        beventId: _beventId,
        runners: _runners,
        fancyId: _fancyId,
        fancyType,
        ...rest
      } = payload;

      const body = {
        ...rest,
        market_id: payload.market_id ?? null,
        api_key: API_KEY,
      };

      // Provider A uses a single `market_type` field for every bet type.
      // Sport bets already pass `market_type` from the caller (kept via
      // ...rest). For fancy / fancy1 / oddeven the caller passes
      // `fancyType`, which we rename to `market_type` here so the
      // outgoing payload is consistent. Provider B is untouched: it
      // still reads `fancyType` from the original caller payload.
      if (fancyType !== undefined && body.market_type === undefined) {
        body.market_type = fancyType;
      }

      const response = await axios.post(
        `${RESULT_API_URL}/bet-incoming?key=${API_KEY}`,
        body,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },

    async fetchCasinoTables() {
      const response = await axios.get(
        `${API_URL}/diamond/direct-casino-table-list?key=${API_KEY}`,
        { timeout: 10000 }
      );

      return response.data;
    },
    // async fetchCasinoTables() {
    //   console.log('Fetching casino tables...');
    //   const response = await axios.get(
    //     `${API_URL}/casino/tableid?key=${API_KEY}`,
    //     // { timeout: 10000 }
    //   );
    //   console.log('Fetched casino tables:', response);

    //   return response.data;
    // },

    async fetchCasinoData(eventName) {
      // worli/matka family round-based hy: base /data/<slug> rounds-list deta hy,
      // markets sirf /data/<slug>_<mid> pe. Tabdata se OPEN rounds lo, ek batch
      // request me sab ke markets, aur sections boards (5s TTL) saath attach karo.
      if (ROUND_BASED_SLUGS.has(eventName)) {
        return fetchRoundBasedCasinoData(eventName);
      }
      const response = await axios.get(
        `${API_URL}/diamond/direct-casino/data/${encodeURIComponent(eventName)}?key=${API_KEY}`,
        { timeout: 10000 }
      );

      // The provider wraps the table as { fetchedAt, eventName, data: { success, data } }.
      // Everything downstream (socket polling, bet validation, the API) expects
      // { success, data }, so unwrap it once here.
      const table = response.data?.data;
      let payloadData = table?.data ?? null;
      if (payloadData && MATKA_SLUGS.has(eventName)) {
        const sections = await fetchSections(eventName);
        payloadData = {
          ...payloadData,
          sub: augmentMatkaSub(payloadData.sub, sections),
          sections,
        };
      }
      return {
        success: Boolean(table?.success && payloadData),
        data: payloadData,
      };
    },

    // Cricket-casino (cricketv) live game feed — reference /api/front/cricketvdata2
    // ka provider equivalent. Virtual cricket (iscc 1) events ke liye. Response
    // { fetchedAt, etid, gmid, data: { success, data: { t1: {card, ft, lt} } } }.
    // Not-found par { error, key } aata hy -> success:false.
    async fetchCricketCasino(gmid) {
      const response = await axios.get(
        `${API_URL}/diamond/cricket-casino/4_${encodeURIComponent(gmid)}?key=${API_KEY}`,
        { timeout: 10000 }
      );
      const table = response.data?.data;
      const payloadData = table?.data ?? null;
      return {
        success: Boolean(table?.success && payloadData),
        data: payloadData,
      };
    },
    // async fetchCasinoData(eventName) {
    // //   const response = await axios.get(
    // //     `${API_URL}/casino/data?key=${API_KEY}&type=${eventName}`
    // //   );
    // //   return response.data;
    // },

    async fetchCasinoResult(eventName) {
      const response = await axios.get(
        `${API_URL}/diamond/direct-casino/result/${encodeURIComponent(eventName)}?key=${API_KEY}`,
        { timeout: 10000 }
      );

      // direct-casino result wraps the payload as { fetchedAt, eventName, data: { success, data } }.
      // Downstream (settlement cron, /api/casino-betting-result) expects { success, data: { res } },
      // so unwrap once here. Bare { success, ... } responses pass through untouched.
      const raw = response.data;
      return raw?.success === undefined && raw?.data ? raw.data : raw;
    },

    async fetchDirectCasinoResultByDate(date, eventName) {
      const response = await axios.get(
        `${API_URL}/diamond/direct-casino/result/${encodeURIComponent(date)}/${encodeURIComponent(eventName)}`,
        {
          headers: {
            'X-API-Key': API_KEY,
          },
          timeout: 10000,
        }
      );
      return response.data;
    },

    async fetchCasinoDetailResult(eventName, mid) {
      const response = await axios.get(
        `${API_URL}/casino/detail_result?key=${API_KEY}&type=${eventName}&mid=${mid}`
      );
      return response.data.data;
    },

    async fetchCricketFancyResult(eventId, fancyId) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchCricketFancyByEvent(eventId) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchStFancyByEvent(eventId) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchScore(gmid, sid) {
      return { success: false, message: 'Not supported by Provider A' };
    },

    async fetchAllIframes(gmid) {
      return { success: false, message: 'Not supported by Provider A' };
    },
  };
}
