require('dotenv').config()

module.exports = async (req, res) => {
    try {
        // TODO: something
        res.status(200).send(`OK`);
    } catch (e) {
        console.log('\nCaught exception: ' + e)
        res.status(500).send('ERROR 500');
    }
}
