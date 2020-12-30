require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {createDfuseClient} = require("@dfuse/client")

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=600')
    const client = createDfuseClient({
        authentication: false,
        network: 'eos.dfuse.eosnation.io' // 'kylin.dfuse.eosnation.io'
    });

    try {
        let pools = [];
        const states = await client.stateTableScopes("mindswapswap", "stat");
        const tables = await client.stateTablesForScopes("mindswapswap", states.scopes, "stat", {
            json: true,
            keyType: "symbol_code"
        });
        client.release();

        tables.tables.forEach((table) => {
            pools.push(table.rows[0]);
        })

        res.status(200).send({
            pools
        });

    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
