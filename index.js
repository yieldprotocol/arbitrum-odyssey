const {
  ZERO_ADDRESS,
  START_TIMESTAMP,
  END_TIMESTAMP,
  ONE_DAY,
  STRATEGIES,
  AMOUNT_THRESHOLD,
} = require("./constants");
const { getRes } = require("./helpers");

// csv writing data
const STRATEGY_PROVIDERS_CSV_PATH = "STRATEGY_PROVIDERS.csv";
const CSV_HEADER = [{ id: "account", title: "Account" }];

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const writer = createCsvWriter({
  path: STRATEGY_PROVIDERS_CSV_PATH,
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
          ${'["' + STRATEGIES.join('","') + '"]'}, 
           timestamp_gte:${timestamp}, timestamp_lt: ${
        timestamp + ONE_DAY
      }}, orderDirection:asc, orderBy:timestamp) {
          from
          to
          timestamp
          amountStrategyTokens
        }
    }
    `;

      const {
        data: { liquidities },
      } = await getRes(query);

      liquidities.forEach((liq) => {
        if (
          liq.timestamp <= END_TIMESTAMP &&
          liq.amountStrategyTokens > AMOUNT_THRESHOLD
        ) {
          liqProviders.add(liq.to);
          liq.from !== ZERO_ADDRESS && liqProviders.add(liq.from);
        }
      });

      // use the latest timestamp as the new timestamp to query
      timestamp = liquidities[liquidities.length - 1].timestamp;
    } while (timestamp < END_TIMESTAMP);

    console.log("liq providers size", liqProviders.size);
    return liqProviders;
  };

  const liqProviders = await _getLiqProviders();

  // write to dai strat csv
  writer
    .writeRecords(
      [...liqProviders.values()].map((lp) => ({
        account: lp.account,
      }))
    )
    .then(() =>
      console.log(
        "The Strategy liquidity provider CSV file was written successfully using the following parameters:",
        "\n",
        "START_TIMESTAMP: ",
        START_TIMESTAMP,
        "\n",
        "END_TIMESTAMP: ",
        END_TIMESTAMP,
        "\n",
        "STRATEGIES: ",
        STRATEGIES,
        "\n"
      )
    );
}

getEligibleUsers();
