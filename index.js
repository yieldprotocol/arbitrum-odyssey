const { AFFECTED_BLOCK } = require("./constants");
const { getRes } = require("./helpers");

// csv writing data
const path = "data.csv";
const header = [
  { id: "strategyAddr", title: "Strategy Address" },
  { id: "account", title: "Account" },
  { id: "balance", title: "Balance" },
];
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const writer = createCsvWriter({
  path,
  header,
});

async function getStratHolders() {
  let numAccounts = 0;
  const stratHolders = new Set();

  let skip = 0;

  do {
    // get all account balances for all strategies except for frax (unaffected)
    const query = `
  {
    accountBalances(
      block: {number: ${AFFECTED_BLOCK}}
      where: {asset_in: [
        "0x7acfe277ded15caba6a8da2972b1eb93fe1e2ccd",
        "0xa6dbc40c75037895dee8d2415f1ce9e0fb08cf49",
        "0x1144e14e9b0aa9e181342c7e6e0a9badb4ced295",
        "0x9ca2a34ea52bc1264d399aca042c0e83091feece",
        "0xfbc322415cbc532b54749e31979a803009516b5d",
        "0x59e9db2c8995ceeaf6a9ad0896601a5d3289444e",
        "0x8e8d6ab093905c400d583efd37fbeeb1ee1c0c39",
        "0x5dd6dcae25dffa0d46a04c9d99b4875044289fb2",
        "0xcf30a5a994f9ace5832e30c138c9697cda5e1247",
        "0x11f30c6b1173ec6e0a6d622c8f17eef3dc593764",
        "0x831df23f7278575ba0b136296a285600cd75d076",
        "0xb268e2c85861b74ec75fe728ae40d9a2308ad9bb",
        "0x428e229ac5bc52a2e07c379b2f486fefefd674b1",
        "0xf708005cee17b2c5fe1a01591e32ad6183a12eae"
      ], balance_gt: "0"}
      skip: ${skip}
      first: 1000
    ) {
      balance
      account {
        id
      }
      asset {
        name
        id
      }
    }
  }
    `;

    const { data } = await getRes(query);
    const accountBalances = data ? data.accountBalances : null;

    if (accountBalances) {
      accountBalances.forEach((a) => {
        const {
          balance,
          account: { id: account },
          asset: { name: strategyName, id: strategyAddr },
        } = a;

        stratHolders.add({
          strategyAddr,
          strategyName,
          account,
          balance,
        });
      });
    }

    skip += 1000;
    numAccounts += accountBalances ? accountBalances.length : 0;
    console.log(
      "🦄 ~ file: index.js:83 ~ getStratHolders ~ numAccounts:",
      numAccounts
    );
  } while (skip <= 10000); // tries to get first 10000ish accounts

  return stratHolders;
}

const main = async () => {
  writer
    .writeRecords(await getStratHolders())
    .then(() => console.log("The csv file was written successfully"));
};

main();
