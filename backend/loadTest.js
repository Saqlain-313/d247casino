import axios from "axios";
import { performance } from "perf_hooks";

const API_URL = "http://localhost:3000/api/casino-data";
const TOTAL_REQUESTS = 3000;

const startTime = Date.now();

let success = 0;
let failed = 0;
let responseTimes = [];

const requests = Array.from({ length: TOTAL_REQUESTS }, (_, index) => {
  const start = performance.now();

  return axios.get(API_URL)
    .then((response) => {
      const ms = performance.now() - start;
      success++;
      responseTimes.push(ms);

      console.log(
        `#${index + 1} SUCCESS | ${response.status} | ${ms.toFixed(2)} ms`
      );

      return response;
    })
    .catch((error) => {
      const ms = performance.now() - start;
      failed++;

      console.log(
        `#${index + 1} FAILED | ${error.response?.status || error.message} | ${ms.toFixed(2)} ms`
      );

      return null;
    });
});

// No await
Promise.all(requests).then(() => {
  const totalTime = (Date.now() - startTime) / 1000;

  console.log("\n========== FINAL REPORT ==========");
  console.log("Total:", TOTAL_REQUESTS);
  console.log("Success:", success);
  console.log("Failed:", failed);

  console.log(
    "Average:",
    (responseTimes.reduce((a, b) => a + b, 0) / (responseTimes.length || 1)).toFixed(2),
    "ms"
  );

  console.log("Min:", Math.min(...responseTimes).toFixed(2), "ms");
  console.log("Max:", Math.max(...responseTimes).toFixed(2), "ms");
  console.log("Total Duration:", totalTime.toFixed(2), "seconds");
});