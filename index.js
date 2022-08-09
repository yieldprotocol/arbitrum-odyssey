const {
  ZERO_ADDRESS,
  START_TIMESTAMP,
  END_TIMESTAMP,
  ONE_DAY,
  RPC_ENDPOINT,
  DAI_STRAT,
  USDC_STRAT,
  AFFECTED_BLOCK,
} = require("./constants");
const { getRes } = require("./helpers");
const { Contract, ethers } = require("ethers");
const abi = require("./contracts/abis/Strategy.json");
const { formatUnits } = require("ethers/lib/utils");
const { JsonRpcProvider } = require("@ethersproject/providers");

// csv writing data
const DAI_STRAT_CSV_PATH = "ARBITRUM_YSDAI6MJD.csv";
const USDC_STRAT_CSV_PATH = "ARBITRUM_YSUSDC6MJD.csv";
const CSV_HEADER = [
  { id: "account", title: "Account" },
  { id: "balance", title: "Balance" },
];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// YSDAI6MJD
const daiStratWriter = createCsvWriter({
  path: DAI_STRAT_CSV_PATH,
  header: CSV_HEADER,
});

// YSUSDC6MJD
const usdcStratWriter = createCsvWriter({
  path: USDC_STRAT_CSV_PATH,
  header: CSV_HEADER,
});

async function getEligibleUsers() {
  const _getLiqProviders = async () => {
    let timestamp = START_TIMESTAMP;

    const liqProviders = new Set();

    do {
      const query = `
      {
        liquidities(first:1000, where:{strategy_in:
          ["0xe7214af14bd70f6aac9c16b0c1ec9ee1ccc7efda", 
          "0xdc705fb403dbb93da1d28388bc1dc84274593c11"], 
           timestamp_gte:${timestamp}, from:"${ZERO_ADDRESS}", timestamp_lt: ${
        timestamp + ONE_DAY
      }}, orderDirection:asc, orderBy:timestamp) {
          to
          timestamp
        }
    }
    `;

      const {
        data: { liquidities },
      } = await getRes(query);

      liquidities.forEach(
        (liq) => liq.timestamp <= END_TIMESTAMP && liqProviders.add(liq.to)
      );

      // use the latest timestamp as the new timestamp to query
      timestamp = liquidities[liquidities.length - 1].timestamp;
      console.log("size", liqProviders.size);
    } while (timestamp < END_TIMESTAMP);

    const provider = new JsonRpcProvider(RPC_ENDPOINT);
    const daiStrategy = new Contract(DAI_STRAT, abi, provider);
    const usdcStrategy = new Contract(USDC_STRAT, abi, provider);
    const daiDec = await daiStrategy.decimals();
    const usdcDec = await usdcStrategy.decimals();

    const balances = await Promise.all(
      [...liqProviders.values()].map(async (lp) => {
        // YSDAI6MJD
        let daiStratBal;
        try {
          daiStratBal = await daiStrategy.balanceOf(lp, {
            blockTag: AFFECTED_BLOCK - 1,
          });
        } catch (e) {
          daiStratBal = ethers.constants.Zero;
        }

        // YSUSDC6MJD
        let usdcStratBal;
        try {
          usdcStratBal = await usdcStrategy.balanceOf(lp, {
            blockTag: AFFECTED_BLOCK - 1,
          });
        } catch (e) {
          usdcStratBal = ethers.constants.Zero;
        }

        return {
          account: lp,
          daiStratBal: formatUnits(daiStratBal, daiDec),
          usdcStratBal: formatUnits(usdcStratBal, usdcDec),
        };
      })
    );

    return balances;
  };

  const liqProviders = await _getLiqProviders();

  // write to dai strat csv
  daiStratWriter
    .writeRecords(
      liqProviders
        .filter((lp) => Number(lp.daiStratBal) !== 0)
        .map((lp) => ({
          account: lp.account,
          balance: lp.daiStratBal,
        }))
    )
    .then(() => console.log("The DAI CSV file was written successfully"));

  // write to usdc strat csv
  usdcStratWriter
    .writeRecords(
      liqProviders
        .filter((lp) => Number(lp.usdcStratBal) !== 0)
        .map((lp) => ({
          account: lp.account,
          balance: lp.usdcStratBal,
        }))
    )
    .then(() => console.log("The USDC CSV file was written successfully"));
}

getEligibleUsers();
