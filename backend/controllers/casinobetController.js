
/**
 * casinoController.js
 */

import axios from "axios";
import Bet from "../models/CasinoBet.js";
import Round from "../models/CasinoRound.js";
import User from "../models/subAdminModel.js";
import * as engine from "../services/casinoEngine.js";

// --------------------------------------------------
// CASINO API CONFIGURATION
// --------------------------------------------------

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// --------------------------------------------------
// FETCH LIVE CASINO DATA
// --------------------------------------------------

const fetchCasinoData = async (eventName) => {
  if (!API_URL || !API_KEY) {
    throw new Error("API_URL or API_KEY missing in environment");
  }

  const url = `${API_URL.replace(/\/+$/, "")}/diamond/casino/data/${encodeURIComponent(eventName)}`;

  try {
    const response = await axios.get(url, {
      params: { key: API_KEY },
      timeout: 15000,
    });

    console.log("Casino API Status:", response.status);

    return response.data;

  } catch (error) {
    console.error("CASINO API ERROR:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      response: error.response?.data,
    });

    throw error;
  }
};

// --------------------------------------------------
// PLACE BET
// --------------------------------------------------

export const placeBet = async (req, res) => {
  const { slug } = req.params;
  const userId = req.id;

  const {
    roundId,
    side,
    selection,
  } = req.body;

  const odds = Number(req.body.odds);
  const stake = Number(req.body.stake);

  let debited = false;
  let exposure = 0;

  try {
    // 1. Validate game

    if (!engine.familyOf(slug)) {
      return res.status(400).json({
        success: false,
        message: "Game not supported",
      });
    }

    // 2. Validate user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // 3. Validate bet input

    const errors = engine.validateBet(slug, {
      side,
      selection,
      odds,
      stake,
    });

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
      });
    }

    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: "Round ID required",
      });
    }

    // 4. FETCH LIVE CASINO DATA
    // Round schema is NOT used here.

    let casinoResponse;

    try {
      casinoResponse = await fetchCasinoData(slug);

    } catch (error) {
      return res.status(503).json({
        success: false,
        message: "Casino server unavailable",
        error: error.response?.data || error.message,
        code: error.code || null,
        status: error.response?.status || null,
      });
    }

    // 5. Validate API response

    if (!casinoResponse || casinoResponse.success === false) {
      return res.status(400).json({
        success: false,
        message: "Casino API returned unsuccessful response",
      });
    }

    // Support common response wrappers

    const casinoData =
      casinoResponse.data?.data ??
      casinoResponse.data ??
      casinoResponse;

    if (
      !casinoData ||
      typeof casinoData !== "object"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid casino API response",
      });
    }

    // 6. VERIFY LIVE ROUND

    const liveRoundId = String(
      casinoData.roundId ??
      casinoData.mid ??
      casinoData.marketId ??
      ""
    );

    if (!liveRoundId) {
      return res.status(503).json({
        success: false,
        message: "Live round ID missing from casino API",
      });
    }

    if (liveRoundId !== String(roundId)) {
      return res.status(400).json({
        success: false,
        message: "Round expired or invalid",
        liveRoundId,
      });
    }

    // 7. VERIFY BETTING STATUS

    const bettingStatus =
      casinoData.status ??
      casinoData.gameStatus ??
      casinoData.betStatus ??
      casinoData.bettingStatus;

    // Only allow explicitly recognized open states.
    if (
      !bettingStatus ||
      !["open", "betting", "active"].includes(
        String(bettingStatus).toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Betting closed or status unavailable",
        bettingStatus: bettingStatus ?? null,
      });
    }

    // 8. SERVER-SIDE ODDS VALIDATION
    //
    // IMPORTANT:
    // Do not trust req.body.odds in production.
    // Replace this section with your actual provider odds feed.
    //
    // Example:
    // const verifiedOdds = await oddsService.getOdds({
    //   slug, roundId, side, selection
    // });
    //
    // if (verifiedOdds !== odds) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Odds changed. Refresh and try again."
    //   });
    // }

    // 9. CALCULATE EXPOSURE

    exposure = Number(
      engine.calcExposure({
        side,
        stake,
        odds,
      })
    );

    if (
      !Number.isFinite(exposure) ||
      exposure <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exposure amount",
      });
    }

    // 10. ATOMIC BALANCE DEBIT

    const debitResult = await User.findOneAndUpdate(
      {
        _id: userId,
        balance: { $gte: exposure },
      },
      {
        $inc: {
          balance: -exposure,
        },
      },
      {
        new: true,
      }
    );

    if (!debitResult) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    debited = true;

    // 11. CREATE BET

    let bet;

    try {
      bet = await Bet.create({
        userId,
        slug,
        roundId,
        side,
        selection,
        odds,
        stake,
        exposure,
        status: "pending",
      });

    } catch (error) {

      // REFUND IF BET CREATION FAILS

      await User.updateOne(
        { _id: userId },
        {
          $inc: {
            balance: exposure,
          },
        }
      );

      debited = false;

      throw error;
    }

    // 12. SUCCESS RESPONSE

    return res.status(201).json({
      success: true,
      message: "Bet placed successfully",
      bet,
      balance: debitResult.balance,
    });

  } catch (error) {

    console.error("PLACE BET ERROR:", error);

    // Safety refund for unexpected errors after debit.
    // Bet.create failure is already refunded above.
    if (debited) {
      try {
        await User.updateOne(
          { _id: userId },
          {
            $inc: {
              balance: exposure,
            },
          }
        );
      } catch (refundError) {
        console.error("BET REFUND ERROR:", refundError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// --------------------------------------------------
// SETTLE ROUND
// --------------------------------------------------

export const settleRound = async (req, res) => {
  const { slug } = req.params;
  const { roundId, result } = req.body;

  try {
    const round = await Round.findOneAndUpdate(
      {
        slug,
        roundId,
        status: { $ne: "settled" },
      },
      {
        status: "settled",
        result,
      },
      {
        new: true,
      }
    );

    if (!round) {
      return res.status(409).json({
        success: false,
        message: "Round not found or already settled",
      });
    }

    const bets = await Bet.find({
      slug,
      roundId,
      status: "pending",
    }).cursor();

    let settled = 0;
    let failed = 0;

    for await (const bet of bets) {
      try {
        const selOutcome = engine.evaluateSelection(
          slug,
          bet.selection,
          result
        );

        const s = engine.settleBet(
          bet,
          selOutcome
        );

        const claimed = await Bet.findOneAndUpdate(
          {
            _id: bet._id,
            status: "pending",
          },
          {
            $set: {
              status: "settled",
              outcome: s.outcome,
              payout: s.payout,
              net: s.net,
              settledAt: new Date(),
            },
          },
          { new: true }
        );

        if (claimed && s.payout > 0) {
          await User.updateOne(
            { _id: bet.userId },
            {
              $inc: {
                balance: s.payout,
              },
            }
          );
        }

        if (claimed) settled++;

      } catch (error) {
        failed++;

        console.error(
          `Settlement failed for bet ${bet._id}:`,
          error.message
        );
      }
    }

    return res.json({
      success: true,
      settled,
      failed,
    });

  } catch (error) {
    console.error("SETTLE ROUND ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// --------------------------------------------------
// VOID ROUND / REFUND
// --------------------------------------------------

export const voidRound = async (req, res) => {
  try {
    const { slug } = req.params;
    const { roundId } = req.body;

    const bets = await Bet.find({
      slug,
      roundId,
      status: "pending",
    });

    let refunded = 0;

    for (const bet of bets) {
      const claimed = await Bet.findOneAndUpdate(
        {
          _id: bet._id,
          status: "pending",
        },
        {
          $set: {
            status: "void",
            payout: bet.exposure,
            net: 0,
            settledAt: new Date(),
          },
        },
        { new: true }
      );

      if (claimed) {
        await User.updateOne(
          { _id: bet.userId },
          {
            $inc: {
              balance: bet.exposure,
            },
          }
        );

        refunded++;
      }
    }

    await Round.updateOne(
      { slug, roundId },
      {
        status: "settled",
        result: { void: true },
      }
    );

    return res.json({
      success: true,
      refunded,
    });

  } catch (error) {
    console.error("VOID ROUND ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// --------------------------------------------------
// NATION BOOK
// --------------------------------------------------

export const getNationBook = async (req, res) => {
  try {
    const { slug, roundId } = req.params;

    const bets = await Bet.find({
      slug,
      roundId,
      userId: req.id || req.user?._id,
      status: "pending",
    }).lean();

    const book = engine.nationBook(
      slug,
      bets,
      engine.defaultScenarios(slug)
    );

    return res.json({
      success: true,
      book,
    });

  } catch (error) {
    console.error("NATION BOOK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// --------------------------------------------------
// MY BETS
// --------------------------------------------------

export const myBets = async (req, res) => {
  try {
    const { slug } = req.params;

    const bets = await Bet.find({
      userId: req.id || req.user?._id,
      slug,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      bets,
    });

  } catch (error) {
    console.error("MY BETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// --------------------------------------------------
// GAME STATS
// --------------------------------------------------

export const getStats = async (req, res) => {
  try {
    const { slug } = req.params;

    const rounds = await Round.find({
      slug,
      status: "settled",
      "result.void": { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const fam = engine.familyOf(slug);

    const rs = rounds.map((r) => r.result);

    if (fam === "baccarat") {
      return res.json(
        engine.baccaratStats(
          rs.map((r) =>
            r.playerPoints > r.bankerPoints
              ? "p"
              : r.playerPoints < r.bankerPoints
              ? "b"
              : "t"
          )
        )
      );
    }

    if (fam === "dt") {
      return res.json(
        engine.dragonTigerStats(
          rs.reverse().map((r) =>
            r.dragon.rank > r.tiger.rank
              ? "D"
              : r.dragon.rank < r.tiger.rank
              ? "T"
              : "TIE"
          )
        )
      );
    }

    if (fam === "lucky7") {
      return res.json(
        engine.lucky7Stats(
          rs.map((r) => r.card.rank)
        )
      );
    }

    if (fam === "roulette") {
      return res.json(
        engine.rouletteStats(
          rs.map((r) => r.number)
        )
      );
    }

    return res.json({});

  } catch (error) {
    console.error("GET STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
