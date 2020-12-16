require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {createDfuseClient} = require("@dfuse/client")

let balances = [
    {
        name: "IQ",
        precision: 3,
        contract: "everipediaiq",
        balance: 0,
        icon: "tokens/iq.png",
    },
    {
        name: "EOS",
        precision: 4,
        contract: "eosio.token",
        balance: 0,
        icon: "tokens/eos.png",
    },
    {
        name: "YETRUMP",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/yestrump.png",
    },
    {
        name: "NOTRUMP",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/notrump.png",
    },
    {
        name: "YVAC",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/yvac.png",
    },
    {
        name: "NVAC",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/nvac.png",
    },
    {
        name: "YESDFS",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/yesdfs.png",
    },
    {
        name: "NODFS",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/nodfs.png",
    },
    {
        name: "YEIQUPB",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/yeskrw.png",
    },
    {
        name: "NOIQUPB",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/nokrw.png",
    },
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
        name: "YEBIDEN",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/yebiden.png",
    },
    {
        name: "NOBIDEN",
        precision: 3,
        contract: "prediqtokens",
        balance: 0,
        icon: "tokens/nobiden.png",
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
        res.status(403).send('ERROR');
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
    } catch (error) {
        console.log("An error occurred", error)
    }

    client.release()

    try {
        // TODO: something
        res.status(200).send(balances);
    } catch (e) {
        console.log('\nCaught exception: ' + e)
        res.status(500).send('ERROR 500');
    }
}
