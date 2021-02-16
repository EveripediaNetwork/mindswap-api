require('dotenv').config();
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {client} = require("./src/dfuse");
let {balances} = require("./src/constants");

module.exports = async (req, res) => {
    if (!req.query.account) {
        return res.status(403).send('ERROR');
    }

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
        });

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
        });

        const responseHistory = response.data.searchTransactionsBackward.results;
        let transactionHistory = [];
        const transactionHistoryByPool = {};
        const realizedPnl = {};
        if (responseHistory) {
            responseHistory.forEach(transaction => {
                let txn = {};

                txn.time = transaction.block.timestamp;
                txn.txId = transaction.trace.id;

                const action = transaction.trace.matchingActions[0];
                txn.event = action.name;

                txn.toTrade1 = action.json.max_asset1 || action.json.min_asset1 || action.json.initial_pool1?.quantity;
                txn.toTrade2 = action.json.max_asset2 || action.json.min_asset2 || action.json.initial_pool2?.quantity;
                txn.user = action.json.user;

                const op = transaction.trace.matchingActions[0].dbOps;
                if (action.name === "inittoken") { // pool creation
                    txn.toBuySell = op[1].newJSON.object?.balance;
                    const supplyObj = op[0].newJSON.object?.supply;
                    txn.oldBalance = op[1].oldJSON.object ? op[1].oldJSON.object.balance : `0.00 ${op[1].newJSON.object.balance.split(" ")[1]}`;
                    txn.newBalance = op[1].newJSON.object.balance;
                    txn.oldPool1 = op[0].oldJSON.object?.pool1 ? op[0].oldJSON.object.pool1.quantity : `0.00 ${op[0].newJSON.object.pool1.quantity.split(" ")[1]}`;
                    txn.newPool1 = op[0].newJSON.object.pool1.quantity;
                    txn.oldPool2 = op[0].oldJSON.object?.pool2 ? op[0].oldJSON.object.pool2.quantity : `0.00 ${op[0].newJSON.object.pool2.quantity.split(" ")[1]}`;
                    txn.newPool2 = op[0].newJSON.object.pool2.quantity;
                    txn.oldSupply = op[0].oldJSON.object ? op[0].oldJSON.object.supply : `0.00 ${op[0].newJSON.object.supply.split(" ")[1]}`;
                    txn.newSupply = op[0].newJSON.object.supply;
                    txn.supplyToken = supplyObj?.split(" ")[1];
                } else {
                    txn.toBuySell = action.json.to_buy || action.json.to_sell;
                    const supplyObj = op[3].newJSON.object?.supply || op[3].oldJSON.object?.supply;
                    txn.oldBalance = op[2].oldJSON.object ? op[2].oldJSON.object.balance : `0.00 ${op[2].newJSON.object.balance.split(" ")[1]}`;
                    txn.newBalance = op[2].newJSON.object.balance;
                    txn.oldPool1 = op[3].oldJSON.object.pool1.quantity;
                    txn.newPool1 = op[3].newJSON.object.pool1.quantity;
                    txn.oldPool2 = op[3].oldJSON.object.pool2.quantity;
                    txn.newPool2 = op[3].newJSON.object.pool2.quantity;
                    txn.oldSupply = op[3].oldJSON.object.supply;
                    txn.newSupply = op[3].newJSON.object.supply;
                    txn.supplyToken = supplyObj?.split(" ")[1];
                }

                txn.pool1Delta = subtractAssetAmount(txn.newPool1, txn.oldPool1);
                txn.pool2Delta = subtractAssetAmount(txn.newPool2, txn.oldPool2);
                transactionHistory.push(txn);
                if (!(txn.supplyToken in transactionHistoryByPool)) {
                    transactionHistoryByPool[txn.supplyToken] = [];
                }
                transactionHistoryByPool[txn.supplyToken].push(txn);
            });

            Object.entries(transactionHistoryByPool).map(([poolToken, allTxForPool]) => {

                if (!(poolToken in realizedPnl)) {
                    realizedPnl[poolToken] = [];
                }

                const fifo = [];
                allTxForPool.sort((a, b) => a.time > b.time ? 1 : -1).forEach(tx => {
                    if (tx.event === 'remliquidity') {
                        let poolSharesToRemove = getAssetAmount(tx.toBuySell);
                        const realized = {
                            txId: tx.txId,
                            time: tx.time,
                            poolShares: poolSharesToRemove,
                            token1Symbol: tx.toTrade1.split(" ")[1],
                            token2Symbol: tx.toTrade2.split(" ")[1],
                            addToken1: toAsset(0, tx.pool1Delta),
                            addToken2: toAsset(0, tx.pool2Delta),
                            remToken1: subtractAssetAmount(toAsset(0, tx.pool1Delta), tx.pool1Delta),
                            remToken2: subtractAssetAmount(toAsset(0, tx.pool2Delta), tx.pool2Delta),
                        };
                        while (poolSharesToRemove > 0) {
                            const oldestAdd = fifo.pop();
                            if (oldestAdd == null) {
                                console.log("error seems to be removing more liq than added?", poolSharesToRemove, poolToken, fifo)
                                break;
                            }

                            const oldAddPoolShares = getAssetAmount(oldestAdd.toBuySell);

                            if (poolSharesToRemove < oldAddPoolShares) {
                                // removing amount smaller than the add
                                const portionOfPool = poolSharesToRemove / oldAddPoolShares;

                                // update the previous add event first
                                oldestAdd.pool1Delta = subtractAssetAmount(oldestAdd.pool1Delta, oldestAdd.pool1Delta, 1, portionOfPool);
                                oldestAdd.pool2Delta = subtractAssetAmount(oldestAdd.pool2Delta, oldestAdd.pool2Delta, 1, portionOfPool);
                                oldestAdd.toBuySell = subtractAssetAmount(oldestAdd.toBuySell, toAsset(poolSharesToRemove, tx.toBuySell));
                                fifo.push(oldestAdd);

                                // update the realized Pnl entry second
                                realized.addToken1 = addAssetAmount(realized.addToken1, oldestAdd.pool1Delta, 1, portionOfPool);
                                realized.addToken2 = addAssetAmount(realized.addToken1, oldestAdd.pool2Delta, 1, portionOfPool);

                                realized.matchType = "hasPartial";

                                poolSharesToRemove = 0;
                            } else {
                                realized.addToken1 = addAssetAmount(realized.addToken1, oldestAdd.pool1Delta, 1, 1);
                                realized.addToken2 = addAssetAmount(realized.addToken1, oldestAdd.pool2Delta, 1, 1);
                                poolSharesToRemove -= oldAddPoolShares;
                            }
                        }

                        realizedPnl[poolToken].push(realized);
                    } else {
                        fifo.unshift({...tx});
                    }
                });
            });
        }

        res.setHeader('Cache-Control', 'max-age=0, s-maxage=600');
        res.status(200).send({
            pools: pools,
            current: poolBalances,
            transactions: (transactionHistory) ? transactionHistory : null,
            transactionHistoryByPool: transactionHistoryByPool,
            responseHistory: responseHistory,
            realizedPnl: realizedPnl
        });

    } catch (error) {
        console.error("An error occurred", error);
        res.status(500).send('ERROR 500');
    }
};
