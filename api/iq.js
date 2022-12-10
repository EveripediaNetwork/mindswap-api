require('dotenv').config()
global.fetch = require('node-fetch')

module.exports = async (req, res) => {
  const data = await fetch("https://api.mindswap.finance/api/info");
  const result = await data.json();
  res.setHeader('Cache-Control', 'max-age=60, s-maxage=60')
  res.status(200).send(result[0].circulatingSupply)
}
