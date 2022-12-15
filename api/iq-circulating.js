const fetch = require("node-fetch");
require("dotenv").config();
global.fetch = require("node-fetch");

async function getMinterBalance() {
  const data = await fetch(
    "https://api.ethplorer.io/getAddressInfo/0x30953aebf5e3f2c139e9e19bf246dd3a575ddaf7?token=0xa23d33d5e0a61ba81919bfd727c671bb03ab0fea&showETHTotals=false&apiKey=freekey"
  );
  const result = await data.json();
  return result.tokens[0].balance / 1e18;
}

async function circulatingSupply() {
  const IQonEOS = 10021454884;
  const data = await fetch(
    "https://api.ethplorer.io/getTokenInfo/0x579cea1889991f68acc35ff5c3dd0621ff29b0c9?apiKey=" + process.env.ETHPLORER_KEY
  );
  const result = await data.json();
  const IQonETH = result.totalSupply / 1e18;

  const pIQonETH = await getMinterBalance();
  return IQonEOS + IQonETH - pIQonETH;
}

async function getIQBalanceFromBrainDao() {
  const data = await fetch(
    "https://ethplorer.io/service/service.php?data=0x56398b89d53e8731bca8C1B06886CFB14BD6b654"
  );
  const result = await data.json();
  const item = result.balances.find(
    (b) => b.contract === "0x579cea1889991f68acc35ff5c3dd0621ff29b0c9"
  );

  if (!item) throw new Error("Unable to get the IQ balance from BrainDAO");

  return item.balance / 1e18;
}

async function getIQBalance(account) {
  await getIQBalanceFromBrainDao();

  const data = await fetch(
    "https://eos.api.eosnation.io/v1/chain/get_currency_balance",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: "everipediaiq",
        account: account,
        symbol: "IQ",
      }),
    }
  );
  const supply = await circulatingSupply();
  const result = await data.json();

  if (!result[0] || !result[0].split(" ")[0])
    throw new Error("Unable to get the IQ balance");

  const totalIQ = result[0].split(" ")[0];
  const totalIQFromBrainDao = await getIQBalanceFromBrainDao();

  return Number(supply - totalIQ - totalIQFromBrainDao);
}

module.exports = async (_, res) => {
  // const result = await getIQBalance('iqlockupctcr');
  const result = await circulatingSupply();

  if (result instanceof Error) return res.status(500).send(result);
  res.setHeader('Cache-Control', 'max-age=60, s-maxage=60')
  return res.status(200).send(result);
};
