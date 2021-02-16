require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {client} = require("./src/dfuse");
let {balances} = require("./src/constants");

const addAssetAmount = (original, add, portionOriginal = 1, portionAdd = 1) => {
    const originalAmt = portionOriginal * Number(original.split(" ")[0]);
    const addAmt = portionAdd * Number(add.split(" ")[0]);
    return `${originalAmt + addAmt} ${add.split(" ")[1]}`;
};
const subtractAssetAmount = (original, remove, portionOriginal = 1, portionAdd = 1) => {
    const originalAmt = portionOriginal * Number(original.split(" ")[0]);
    const removeAmt = portionAdd * Number(remove.split(" ")[0]);
    return `${originalAmt - removeAmt} ${remove.split(" ")[1]}`;
};
const significantValues = (asset) => asset.split(" ")[0].split(".")[1].length;
const toAsset = (amount, templateAsset) => `${amount.toFixed(significantValues(templateAsset))} ${templateAsset.split(" ")[1]}`;
const getAssetAmount = (asset) => Number(asset.split(" ")[0]);

module.exports = async (req, res) => {
    if (!req.query.account) {
        return res.status(403).send('ERROR');
    }

    let poolBalances = balances.filter(balance => balance.contract === "mindswapswap");

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
        id
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
`;

    try {
        let pools = [];
        const response = await client.graphql(historyQuery, {
            variables: {
                account: req.query.account,
                "limit": 1000,
                "cursor": "",
                "query": "account:mindswapswap (action:addliquidity OR action:remliquidity OR action:inittoken) auth:" + req.query.account
            },
        });
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
            transactions: (transactionHistory) ? transactionHistory : null,
        });

    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
