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

async function getCirculatingSupply() {
  const IQonEOS = 10021453884;
  const data = await fetch(
    "https://ethplorer.io/service/service.php?data=0x579cea1889991f68acc35ff5c3dd0621ff29b0c9"
  );
  const result = await data.json();
  const IQonETH = result.token.totalSupply / 1e18;

  const data2 = await fetch(
    "https://ethplorer.io/service/service.php?data=0xa23d33d5e0a61ba81919bfd727c671bb03ab0fea"
  );
  const result2 = await data2.json();
  const pIQonETH = result2.token.totalSupply / 1e18;
  return IQonEOS + IQonETH - pIQonETH;
}

module.exports = async (_, res) => {
  const circulatingSupply = await getCirculatingSupply();
  const balanceFromBraindao = await getIQBalanceFromBrainDao();
  const result = Number(circulatingSupply - balanceFromBraindao);

  if (result instanceof Error) return res.status(500).send(result);
  res.setHeader('Cache-Control', 'max-age=60, s-maxage=60')
  return res.status(200).send(result);
};
