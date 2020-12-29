require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {createDfuseClient} = require("@dfuse/client")

let balances = [
    {
        name: "IQYDFS",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yesdfs.png",
    },
    {
        name: "IQNDFS",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nodfs.png",
    },
    {
        name: "IQYUPB",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yeskrw.png",
    },
    {
        name: "IQNUPB",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nokrw.png",
    },
    {
        name: "IQYTRMP",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yestrump.png",
    },
    {
        name: "IQNTRMP",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/notrump.png",
    },
    {
        name: "IQYVAC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yvac.png",
    },
    {
        name: "IQNVAC",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nvac.png",
    },
    {
        name: "EOSIQ",
        precision: 4,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/eos.png",
    },
    {
        name: "IQYBID",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/yebiden.png",
    },
    {
        name: "IQNBID",
        precision: 3,
        contract: "mindswapswap",
        balance: 0,
        icon: "tokens/nobiden.png",
    },
];

module.exports = async (req, res) => {
    // res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400')
    if (!req.query.account) {
        return res.status(403).send('ERROR');
    }

    const client = createDfuseClient({
        authentication: false,
        network: 'eos.dfuse.eosnation.io' // 'kylin.dfuse.eosnation.io'
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
          authorization {
            actor
          }
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
        const response = await client.graphql(historyQuery, {
            variables: {
                account: req.query.account,
                "limit": 100,
                "cursor": "",
                "query": "account:mindswapswap (action:addliquidity OR action:remliquidity) auth:" + req.query.account
            },
        })

        const states = await client.stateTableScopes("mindswapswap", "stat");
        let pools = [];
        const tables = await client.stateTablesForScopes("mindswapswap", states.scopes, "stat", { json: true, keyType: "symbol_code" } );
        console.log(tables);

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

        res.status(200).send({
            pools: tables,
            current: balances,
            history: response.data.searchTransactionsBackward.results
        });

    } catch (error) {
        console.log("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
