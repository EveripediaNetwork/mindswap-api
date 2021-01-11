require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {createDfuseClient} = require("@dfuse/client")
let {balances} = require("./src/constants");

module.exports = async (req, res) => {
    if (!req.query.account) {
        return res.status(403).send('ERROR');
    }

    let poolBalances = balances.filter(balance => balance.contract === "mindswapswap");

    const client = createDfuseClient({
        authentication: false,
        network: process.env.DFUSE_URL
    });

    const historyQuery = `query ($query: String!, $limit: Int64!, $cursor: String!, $account: String!) {
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
  searchTransactionsBackward(query: $query, limit: $limit, cursor: $cursor) {
    cursor
    results {
      block {
        timestamp
      }
      trace {
        status
        matchingActions {
          name
          json
          dbOps {
            operation
            oldJSON {
              object
            }
            newJSON {
              object
            }
          }
        }
      }
    }
  }
}
`

    try {
        let pools = [];
        const response = await client.graphql(historyQuery, {
            variables: {
                account: req.query.account,
                "limit": 100,
                "cursor": "",
                "query": "account:mindswapswap (action:addliquidity OR action:remliquidity) auth:" + req.query.account
            },
        })
        const states = await client.stateTableScopes("mindswapswap", "stat");
        const tables = await client.stateTablesForScopes("mindswapswap", states.scopes, "stat", {
            json: true,
            keyType: "symbol_code"
        });
        client.release();

        tables.tables.forEach((table) => {
            pools.push(table.rows[0]);
        })

        response.data.accountBalances.edges.forEach((balance) => {
            poolBalances.forEach(initialBalance => {
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

        const responseHistory = response.data.searchTransactionsBackward.results;
        let transactionHistory=[];
        if(responseHistory){
          responseHistory.forEach( transaction => {
            let txn = {}
            txn.time = transaction.block.timestamp;

            const action = transaction.trace.matchingActions[0];
            txn.event = action.name;
            txn.toTrade1 = action.json.max_asset1;
            txn.toTrade2 = action.json.max_asset2;
            txn.toBuy = action.json.to_buy;
            txn.user = action.json.user;

            const op = transaction.trace.matchingActions[0].dbOps;
            txn.oldBalance = op[2].oldJSON.object ? op[2].oldJSON.object.balance : `0.00 ${op[2].newJSON.object.balance.split(" ")[1]}`;
            txn.newBalance = op[2].newJSON.object.balance;
            txn.oldPool1 = op[3].oldJSON.object.pool1.quantity;
            txn.newPool1 = op[3].newJSON.object.pool1.quantity;
            txn.oldPool2 = op[3].oldJSON.object.pool2.quantity;
            txn.newPool2 = op[3].newJSON.object.pool2.quantity;
            txn.oldSupply = op[3].oldJSON.object.supply;
            txn.newSupply = op[3].newJSON.object.supply;
            transactionHistory.push(txn);
          });
        }

        res.setHeader('Cache-Control', 'max-age=0, s-maxage=600');
        res.status(200).send({
            pools: pools,
            current: poolBalances,
            history: (req.query.hideHistory && req.query.hideHistory === "true") ? null : response.data.searchTransactionsBackward.results,
            transactions: (transactionHistory) ? transactionHistory : null,
        });

    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
