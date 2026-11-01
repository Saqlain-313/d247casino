import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../services/matchApi/index.js', () => ({
  fetchCasinoTables: vi.fn(),
  fetchCasinoResult: vi.fn(),
  fetchCasinoDetailResult: vi.fn(),
}));

vi.mock('../services/casinoTableCache.js', () => ({
  getCasinoTable: vi.fn(),
}));

vi.mock('../config/redis.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
  },
  connectRedis: vi.fn().mockResolvedValue(undefined),
}));

import redis from '../config/redis.js';
import { fetchCasinoTables } from '../services/matchApi/index.js';
import { getCasinoData } from '../controllers/casinoController.js';

const createResponse = () => {
  const response = {
    status: vi.fn(),
    type: vi.fn(),
    send: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.type.mockReturnValue(response);
  response.send.mockReturnValue(response);
  return response;
};

describe('getCasinoData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shares one Redis read across concurrent requests and reuses it briefly', async () => {
    const data = [{ eventName: 'roulette' }];
    redis.get.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return JSON.stringify(data);
    });

    const requests = Array.from({ length: 20 }, async () => {
      const response = createResponse();
      await getCasinoData({}, response);
      return response;
    });

    const responses = await Promise.all(requests);

    expect(redis.get).toHaveBeenCalledTimes(1);
    expect(fetchCasinoTables).not.toHaveBeenCalled();
    for (const response of responses) {
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.type).toHaveBeenCalledWith('json');
      expect(response.send).toHaveBeenCalledWith(
        JSON.stringify({ success: true, data })
      );
    }

    await getCasinoData({}, createResponse());
    expect(redis.get).toHaveBeenCalledTimes(1);
  });
});
