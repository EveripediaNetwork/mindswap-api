require('dotenv').config()
const {tokens} = require("./src/constants");

module.exports = async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(tokens);
    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
