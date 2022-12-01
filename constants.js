const GRAPH_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/yieldprotocol/v2-arbitrum";

const START_TIMESTAMP = 1644393600;
const END_TIMESTAMP = 1659706877;

// one day in seconds
const ONE_DAY = 24 * 60 * 60;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const STRATEGIES = [
  "0xe7214af14bd70f6aac9c16b0c1ec9ee1ccc7efda",
  "0xdc705fb403dbb93da1d28388bc1dc84274593c11",
];

module.exports = {
  GRAPH_ENDPOINT,
  START_TIMESTAMP,
  END_TIMESTAMP,
  ZERO_ADDRESS,
  ONE_DAY,
  STRATEGIES,
};
