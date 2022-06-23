const info = require("./info");
const fetch = require("node-fetch");
require('dotenv').config();
global.fetch = require('node-fetch');


async function getIQBalanceFromBrainDao() {
  const data = await fetch("https://ethplorer.io/service/service.php?data=0x56398b89d53e8731bca8C1B06886CFB14BD6b654");
  const result = await data.json();
  const balance = result.balances.find(b === "0x579cea1889991f68acc35ff5c3dd0621ff29b0c9")

  if(!balance)
    throw new Error("Unable to get the IQ balance");

  return balance / 1e18
}

async function getIQBalance(account) {
  await getIQBalanceFromBrainDao();

  const data = await fetch(
    'https://eos.api.eosnation.io/v1/chain/get_currency_balance',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'everipediaiq', 
        account: account, 
        symbol: 'IQ' 
      }) 
    }
  )
  const supply = await info.circulatingSupply();
  const result = await data.json();
  
  if(!result[0] || !result[0].split(' ')[0])
    throw new Error("Unable to get the IQ balance");
  
  const totalIQ = result[0].split(' ')[0];
  const totalIQFromBrainDao = await getIQBalanceFromBrainDao();

  return Number(supply - totalIQ - totalIQFromBrainDao);
}


module.exports = async(_, res) => {
  const result = await getIQBalance('iqlockupctcr');

  if (result instanceof Error)
    return res.status(500).send(result);

  return res.status(200).send(result);
};
