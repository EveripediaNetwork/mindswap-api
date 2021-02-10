const {createDfuseClient, FileApiTokenStore} = require("@dfuse/client")

const client = createDfuseClient({
    network: process.env.DFUSE_URL,
    apiKey: process.env.DFUSE_KEY,
    apiTokenStore: new FileApiTokenStore(require("os").tmpdir() + "/dfuse-token.json")
});

module.exports.client = client;
