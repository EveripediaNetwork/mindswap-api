global.fetch = require("node-fetch");

const getEosSupplyUsingGreymassAPI = async () => {
  try {

    const body = {"json":true,"code":"everipediaiq","scope":"IQ","table":"stat","index_position":1,"key_type":"","limit":"1"};

    const response = await fetch('https://eos.greymass.com/v1/chain/get_table_rows', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
    const data = await response.json();
    const result = data.rows[0].supply.split(' ')
    return parseInt(result[0])
  } catch (err) {
    console.log(err.response.message)
    return 0
  }
}

export const getEosSupply = async () => {
    try {
      const response = await fetch(
        'https://www.api.bloks.io/tokens/IQ-eos-everipediaiq',
      )
      const result = await response.json()
      const iqSupply = result[0].supply.circulating
      if (iqSupply > 0) return iqSupply
      const fallBackAPIIqSupply = await getEosSupplyUsingGreymassAPI()
      return fallBackAPIIqSupply
    } catch (err) {
      console.log(err.response.message)
      const result = await getEosSupplyUsingGreymassAPI()
      return result
    }
}
