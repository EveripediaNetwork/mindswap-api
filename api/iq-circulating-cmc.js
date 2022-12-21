const fetch = require('node-fetch');
const {eos_supply} = require("./src/constants");

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

async function getMinterBalance() {
  const data = await fetch(
    "https://api.ethplorer.io/getAddressInfo/0x30953aebf5e3f2c139e9e19bf246dd3a575ddaf7?token=0xa23d33d5e0a61ba81919bfd727c671bb03ab0fea&showETHTotals=false&apiKey=" + process.env.ETHPLORER_KEY
  );
  const result = await data.json();
  return result.tokens[0].balance / 1e18;
}

async function getCirculatingSupply() {
  const data = await fetch(
    "https://ethplorer.io/service/service.php?data=0x579cea1889991f68acc35ff5c3dd0621ff29b0c9"
  );
  const result = await data.json();
  const IQonETH = result.token.totalSupply / 1e18;

  const pIQonETH = await getMinterBalance();
  return eos_supply + IQonETH - pIQonETH;
}

module.exports = async (_, res) => {
  const circulatingSupply = await getCirculatingSupply();
  const balanceFromBraindao = await getIQBalanceFromBrainDao();
  const result = Number(circulatingSupply - balanceFromBraindao);

  if (result instanceof Error) return res.status(500).send(result);
  res.setHeader('Cache-Control', 'max-age=60, s-maxage=60')
  return res.status(200).send(result);
};
