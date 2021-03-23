require('dotenv').config()
global.fetch = require('node-fetch')

module.exports = async (req, res) => {
  const data = await fetch("https://www.api.bloks.io/tokens/IQ-eos-everipediaiq");
  const result = data.json();
  res.status(200).send(result.supply.circulating)
}
