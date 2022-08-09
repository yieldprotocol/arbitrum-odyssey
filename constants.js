const GRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/yieldprotocol/v2-arbitrum";

// 2022-02-09T00:00:00 GMT
// protocol launch
const START_TIMESTAMP = 1644393600;
// 2022-08-09T00:00:00 GMT
const END_TIMESTAMP = 1659706877;

const AFFECTED_BLOCK = 19459568;

// one day in seconds
const ONE_DAY = 24 * 60 * 60;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const RPC_ENDPOINT =
  "https://arb-mainnet.g.alchemy.com/v2/V409n11Dod8rjD56a_ASGjJQGkslQV8Y";

const DAI_STRAT = "0xe7214af14bd70f6aac9c16b0c1ec9ee1ccc7efda";
const USDC_STRAT = "0xdc705fb403dbb93da1d28388bc1dc84274593c11";

module.exports = {
  GRAPH_ENDPOINT,
  START_TIMESTAMP,
  END_TIMESTAMP,
  ZERO_ADDRESS,
  ONE_DAY,
  RPC_ENDPOINT,
  DAI_STRAT,
  USDC_STRAT,
  AFFECTED_BLOCK,
};
