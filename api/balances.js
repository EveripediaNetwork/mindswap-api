require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
let {balances} = require("./src/constants");
const {client} = require("./src/dfuse");

module.exports = async (req, res) => {
    if (!req.query.account) {
        return res.status(403).send('ERROR');
    }


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
        let tokensToRefresh = [];

        const requestLibTokens = (req.query.refresh) ? req.query.refresh : "everipediaiq-IQ,eosio.token-EOS";
        const tokensAccount = requestLibTokens.split(",");
        for (const account of tokensAccount) {
            const balance = account.split("-");
            const res = await client.stateTable(balance[0], req.query.account, "accounts");
            for (const row of res.rows) {
                if (tokenFromBalance(row.json.balance) === balance[1]) {
                    tokensToRefresh[account] = balanceToInt(row.json.balance);
                }
            }
        }

        response.data.accountBalances.edges.forEach((balance) => {
            balances.forEach(initialBalance => {
                if (
                    balance &&
                    balance.node &&
                    initialBalance &&
                    balance.node.contract === initialBalance.contract &&
                    balance.node.symbol === initialBalance.name
                ) {
                    const key = balance.node.contract + '-' + balance.node.symbol;
                    initialBalance.balance = (tokensToRefresh[key]) ? tokensToRefresh[key] : balanceToInt(balance.node.balance);
                }
            });
        })

        client.release()

        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(balances);
    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}

function balanceToInt(balance) {
    return parseInt(balance.split(" ")[0].replace(".", ""))
}

function tokenFromBalance(balance) {
    return balance.split(" ")[1]
}
