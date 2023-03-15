const { ZERO_ADDRESS, LADLE, ONE_DAY } = require("./constants");
const { getRes } = require("./helpers");

// csv writing data
const CSV_PATH = "data.csv";
const CSV_HEADER = [
  { id: "account", title: "Account" },
  { id: "seriesId", title: "SeriesId" },
  { id: "seriesName", title: "SeriesName" },
  { id: "vaultId", title: "vaultId" },
  { id: "debtAmountFmt", title: "debtAmountFmt" },
  { id: "debtAmount", title: "debtAmount" },
  { id: "collateralAmountFmt", title: "collateralAmountFmt" },
  { id: "collateralAmount", title: "collateralAmount" },
  { id: "collateralSymbol", title: "collateralSymbol" },
];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: CSV_PATH,
  header: CSV_HEADER,
});

// get all current debt holders by getting vaults
const getVaults = async () => {
  let numAccounts = 0;
  const vaultData = new Set();
  let skip = 0;

  do {
    const query = `
      {
        accounts(where: {vaults_: {debtAmount_gt: "0", series_in: [
          "0x0030ff00028b", 
          "0x0031ff00028b", 
          "0x0032ff00028b", 
          "0x00a0ff00028b", 
        ]}}, skip: ${skip}, first: 1000) {
          vaults {
            id
            debtAmount
            series {
              fyToken {
                symbol
                name
                decimals
              }
              id
              baseAsset {
                assetId
                name
                symbol
              }
            }
            collateralAmount
            collateral {
              asset {
                symbol
                name
                assetId
                decimals
              }
            }
          }
          id
        }
      }
    `;

    const { data } = await getRes(query);
    const accounts = data ? data.accounts : null;

    if (accounts) {
      accounts.forEach((a) => {
        const { id: account, vaults } = a;

        vaults.forEach((v) => {
          const {
            id: vaultId,
            debtAmount,
            collateralAmount,
            series,
            collateral,
          } = v;
          const {
            fyToken: { name: seriesName, decimals: fyTokenDecimals },
            id: seriesId,
          } = series;
          const {
            asset: { decimals: collateralDecimals, symbol: collateralSymbol },
          } = collateral;

          if (
            seriesName.includes("2306") &&
            +debtAmount > 0 &&
            +collateralAmount !== +debtAmount // filter out vaults associated with adding liquidity
          ) {
            vaultData.add({
              account,
              seriesId,
              seriesName,
              vaultId,
              debtAmountFmt: debtAmount,
              debtAmount: (+debtAmount * 10 ** fyTokenDecimals).toString(),
              collateralAmountFmt: collateralAmount,
              collateralAmount: (
                +collateralAmount *
                10 ** collateralDecimals
              ).toString(),
              collateralSymbol,
            });
          }
        });
      });
    }

    skip += 1000;
    numAccounts += accounts ? accounts.length : 0;
    console.log(
      "🦄 ~ file: index.js:88 ~ getVaults ~ numAccounts:",
      numAccounts
    );
  } while (skip <= 10000); // tries to get first 10000ish accounts

  // write to csv
  csvWriter
    .writeRecords(vaultData)
    .then(() => console.log("The CSV file was written successfully"));
};

getVaults();
