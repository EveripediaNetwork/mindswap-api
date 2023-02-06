import axios from "axios"

const getEosSupplyUsingGreymassAPI = async () => {
  try {
    const response = await axios.post(
      'https://eos.greymass.com/v1/chain/get_table_rows',
      '{"json":true,"code":"everipediaiq","scope":"IQ","table":"stat","index_position":1,"key_type":"","limit":"1"}',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    const result = response.data.rows[0].supply.split(' ')
    return result[0]
  } catch (err) {
    console.log(getError(err))
    return 0
  }
}

export const getEosSupply = async () => {
    try {
      const response = await fetch(
        'https://www.api.bloks.io/tokens/IQ-eos-everipediaiq',
      )
      const result = await response.json()
      return result[0].supply.circulating
    } catch (err) {
      console.log(err.response.message)
      const result = await getEosSupplyUsingGreymassAPI()
      return result
    }
}