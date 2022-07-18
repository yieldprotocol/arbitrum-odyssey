const {
  AMOUNT_THRESHOLD,
  ZERO_ADDRESS,
  LADLE,
  START_TIMESTAMP,
  END_TIMESTAMP,
} = require("./constants");
const { getRes } = require("./helpers");

// csv writing data
const CSV_PATH = "data.csv";
const CSV_HEADER = [{ id: "account", title: "Account" }];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: CSV_PATH,
  header: CSV_HEADER,
});

async function getEligibleUsers() {
  // proxy for borrowing: when the pool trades from fyToken to base (above threshold) and then base is transferred from ladle to user
  const _getBorrowers = async () => {
    let timestamp = START_TIMESTAMP;

    const borrowers = new Set();

    do {
      const query = `
    {
      trades(first:1000, where:{amountFYToken_lte:"-${AMOUNT_THRESHOLD}", from:"${LADLE}", timestamp_gte:${timestamp}}, orderDirection:asc, orderBy:timestamp) {
        to
        timestamp
      }
     }
    `;

      const {
        data: { trades },
      } = await getRes(query);

      trades.forEach(
        (trade) => trade.timestamp <= END_TIMESTAMP && borrowers.add(trade.to)
      );

      // use the latest timestamp as the new timestamp to query
      timestamp = trades[trades.length - 1].timestamp;
    } while (timestamp <= END_TIMESTAMP);

    return borrowers;
  };

  // proxy for lending: some amount of base (above threshold) was traded for fyToken then transferred to user
  const _getLenders = async () => {
    let timestamp = START_TIMESTAMP;

    const lenders = new Set();

    do {
      const query = `
    {
      trades(first:1000, where:{amountBaseToken_lte:"-${AMOUNT_THRESHOLD}", timestamp_gte:${timestamp}}, orderDirection:asc, orderBy:timestamp) {
        to
        timestamp
      }
     }
    `;

      const {
        data: { trades },
      } = await getRes(query);

      trades.forEach(
        (trade) => trade.timestamp <= END_TIMESTAMP && lenders.add(trade.to)
      );

      // use the latest timestamp as the new timestamp to query
      timestamp = trades[trades.length - 1].timestamp;
    } while (timestamp <= END_TIMESTAMP);

    return lenders;
  };

  // get instances where strategy tokens were transferred to user
  const _getLiqProviders = async () => {
    let timestamp = START_TIMESTAMP;

    const liqProviders = new Set();

    do {
      const query = `
    {
      liquidities(first:1000, where:{amountStrategyTokens_gte:"${AMOUNT_THRESHOLD}", from: "${ZERO_ADDRESS}", timestamp_gte:${timestamp}}, orderDirection:asc, orderBy:timestamp) {
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
    } while (timestamp <= END_TIMESTAMP);

    return liqProviders;
  };

  const borrowers = await _getBorrowers();
  const lenders = await _getLenders();
  const liqProviders = await _getLiqProviders();

  const allUsers = [...borrowers, ...lenders, ...liqProviders].map(
    (account) => ({ account })
  );

  // write to csv
  csvWriter
    .writeRecords(allUsers)
    .then(() => console.log("The CSV file was written successfully"));
}

getEligibleUsers();
