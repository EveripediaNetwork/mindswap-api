const info = require("./info");
const fetch = require("node-fetch");
require('dotenv').config();
global.fetch = require('node-fetch');

// async function circulatingSupply() {
//   const IQonEOS = 10021453884;
//   const data = await fetch("https://ethplorer.io/service/service.php?data=0x579cea1889991f68acc35ff5c3dd0621ff29b0c9");
//   const result = await data.json();
//   const IQonETH = result.token.totalSupply / 1e18;

//   const data2 = await fetch("https://ethplorer.io/service/service.php?data=0xa23d33d5e0a61ba81919bfd727c671bb03ab0fea");
//   const result2 = await data2.json();
//   const pIQonETH = result2.token.totalSupply / 1e18;
//   return IQonEOS + IQonETH - pIQonETH;
// }


// (async() =>  {
//   const data = await fetch(
//     'https://eos.api.eosnation.io/v1/chain/get_currency_balance',
//     {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         code: 'everipediaiq', 
//         account: 'iqlockupctcr', 
//         symbol: 'IQ' 
//       }) 
//     }
//   )
//   const supply = await circulatingSupply();
//   const result = await data.json();
  
//   if(!result[0] || !result[0].split(' ')[0])
//     throw new Error("Unable to get the IQ balance");
  
//   const totalIQ = result[0].split(' ')[0];
//   console.log("SUPPLY", supply);
//   console.log("TOTAL IQ", totalIQ);
//   console.log(Number(supply - totalIQ));
// })();


async function getIQBalance(account) {
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

  return Number(supply - totalIQ);
}


module.exports = async(_, res) => {
  const result = await getIQBalance('iqlockupctcr');

  if (result instanceof Error)
    return res.status(500).send(result);

  return res.status(200).send(result);
};
