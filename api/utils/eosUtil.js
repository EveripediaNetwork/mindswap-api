export const getEosSupply = async () => {
    try {
      const response = await fetch(
        'https://www.api.bloks.io/tokens/IQ-eos-everipediaiq',
      )
      const result = await response.json()
      return result[0].supply.circulating
    } catch (err) {
      console.log(getError(err))
      return 0
    }
}