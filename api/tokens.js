require('dotenv').config()
const {tokens} = require("./src/constants");

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=600')
    try {
        res.status(200).send(tokens);
    } catch (error) {
        console.error("An error occurred", error)
        res.status(500).send('ERROR 500');
    }
}
