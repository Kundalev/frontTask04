const express = require('express'),
    app = express(),
    request = require('request')



const host = '127.0.0.1'
const port = 3000

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', (req, res) => {
    request(
        'https://api.kraken.com/0/public/AssetPairs',
        (err, response, body) => {
            if (err) return res.status(500).send({ message: err })

            return res.send(body)
        }
    )
})

app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
)