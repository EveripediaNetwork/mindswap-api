require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {createDfuseClient} = require("@dfuse/client")
let { balances } = require("./src/constants");

module.exports = async (req, res) => {
    // res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400')
    if (!req.query.account) {
        return res.status(403).send('ERROR');
    }

    const client = createDfuseClient({
        authentication: false,
        network: 'eos.dfuse.eosnation.io' // 'kylin.dfuse.eosnation.io'
    });

    const balancesQuery = `query($account: String!) {
        accountBalances(account: $account, limit: 100) {
            edges {
                node {
                    contract
                    symbol
                    precision
                    balance
                }
            }
        }
    }`

    try {
        const response = await client.graphql(balancesQuery, {
            variables: {account: req.query.account},
        })

        response.data.accountBalances.edges.forEach((balance) => {
            balances.forEach(initialBalance => {
                if (
                    balance &&
                    balance.node &&
                    initialBalance &&
                    balance.node.contract === initialBalance.contract &&
                    balance.node.symbol === initialBalance.name
                ) {
                    initialBalance.balance = parseInt(balance.node.balance.split(" ")[0].replace(".", ""))
                }
            });
        })

        client.release()

        res.status(200).send(balances);
    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
