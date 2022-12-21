const fetch = require("node-fetch");
require("dotenv").config();
global.fetch = require("node-fetch");
const {eos_supply} = require("./src/constants");

async function getMinterBalance() {
  const data = await fetch(
    "https://api.ethplorer.io/getAddressInfo/0x30953aebf5e3f2c139e9e19bf246dd3a575ddaf7?token=0xa23d33d5e0a61ba81919bfd727c671bb03ab0fea&showETHTotals=false&apiKey=" + process.env.ETHPLORER_KEY
  );
  const result = await data.json();
  return result.tokens[0].balance / 1e18;
}

async function circulatingSupply() {
  const data = await fetch(
    "https://api.ethplorer.io/getTokenInfo/0x579cea1889991f68acc35ff5c3dd0621ff29b0c9?apiKey=" + process.env.ETHPLORER_KEY
  );
  const result = await data.json();
  const IQonETH = result.totalSupply / 1e18;
  const pIQonETH = await getMinterBalance();
  return eos_supply + IQonETH - pIQonETH;
}

async function coinGeckoData() {
  const data = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=everipedia&vs_currencies=usd%2Ckrw%2Cidr%2Csgd%2Cthb&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true"
  );
  const result = await data.json();
  return result.everipedia;
}

module.exports.circulatingSupply = circulatingSupply();

module.exports = async (_, res) => {
  const supply = await circulatingSupply();
  const data = await coinGeckoData();
  res.setHeader('Cache-Control', 'max-age=60, s-maxage=60');
  res.status(200).send([
    {
      symbol: "IQ",
      currencyCode: "KRW",
      price: data.krw,
      marketCap: data.krw * supply,
      accTradePrice24h: data.krw_24h_vol,
      circulatingSupply: supply,
      maxSupply: 21000000000,
      provider: "Everipedia",
      lastUpdatedTimestamp: data.last_updated_at * 1000,
    },
    {
      symbol: "IQ",
      currencyCode: "USD",
      price: data.usd,
      marketCap: data.usd * supply,
      accTradePrice24h: data.usd_24h_vol,
      circulatingSupply: supply,
      maxSupply: 21000000000,
      provider: "Everipedia",
      lastUpdatedTimestamp: data.last_updated_at * 1000,
    },
    {
      symbol: "IQ",
      currencyCode: "IDR",
      price: data.idr,
      marketCap: data.idr * supply,
      accTradePrice24h: data.idr_24h_vol,
      circulatingSupply: supply,
      maxSupply: 21000000000,
      provider: "Everipedia",
      lastUpdatedTimestamp: data.last_updated_at * 1000,
    },
    {
      symbol: "IQ",
      currencyCode: "SGD",
      price: data.sgd,
      marketCap: data.sgd * supply,
      accTradePrice24h: data.sgd_24h_vol,
      circulatingSupply: supply,
      maxSupply: 21000000000,
      provider: "Everipedia",
      lastUpdatedTimestamp: data.last_updated_at * 1000,
    },
    {
      symbol: "IQ",
      currencyCode: "THB",
      price: data.thb,
      marketCap: data.thb * supply,
      accTradePrice24h: data.thb_24h_vol,
      circulatingSupply: supply,
      maxSupply: 21000000000,
      provider: "Everipedia",
      lastUpdatedTimestamp: data.last_updated_at * 1000,
    },
  ]);
};
