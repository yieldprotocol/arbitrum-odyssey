const GRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/yieldprotocol/v2-arbitrum";

const START_TIMESTAMP = 1644393600;
const END_TIMESTAMP = 1659706877;

// one day in seconds
const ONE_DAY = 24 * 60 * 60;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const STRATEGIES = [
  "0xa3caf61fd23d374ce13c742e4e9fa9fac23ddae6", // YSDAI6MJD
  "0xe779cd75e6c574d83d3fd6c92f3cbe31dd32b1e1", // YSDAI6MMS
  "0x54f08092e3256131954dd57c04647de8b2e7a9a9", // YSUSDC6MJD
  "0x92a5b31310a3ed4546e0541197a32101fcfbd5c8", // YSUSDC6MMS
];

const AMOUNT_THRESHOLD = 40; // 40 DAI/USDC strategy tokens as a proxy for 50 USD

module.exports = {
  GRAPH_ENDPOINT,
  START_TIMESTAMP,
  END_TIMESTAMP,
  ZERO_ADDRESS,
  ONE_DAY,
  STRATEGIES,
  AMOUNT_THRESHOLD,
};
