require("isomorphic-fetch");
const { GRAPH_ENDPOINT } = require("./constants");

const getRes = async (query) => {
  const res = await fetch(GRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
    }),
  });

  return await res.json();
};

module.exports = {
  getRes,
};
