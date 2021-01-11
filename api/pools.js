require('dotenv').config()
global.fetch = require("node-fetch");
global.WebSocket = require("ws");
const {createDfuseClient} = require("@dfuse/client")

module.exports = async (req, res) => {
    const client = createDfuseClient({
        authentication: false,
        network: process.env.DFUSE_URL
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

        res.setHeader('Cache-Control', 'Cache-Control: s-maxage=1, stale-while-revalidate');
        res.status(200).send({
            pools
        });

    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
