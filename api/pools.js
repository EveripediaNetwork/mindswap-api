require('dotenv').config()

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400')
    if (!req.query.account) {
        res.status(403).send('ERROR');
    }

    try {
        // TODO: something
        res.status(200).send(`OK`);
    } catch (e) {
        console.log('\nCaught exception: ' + e)
        res.status(500).send('ERROR 500');
    }
}
