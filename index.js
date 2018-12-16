const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const port = process.env.Port || 3000;

let alerting = false;
const grafanaStatuses = ['ok', 'paused', 'alerting', 'pending', 'no_data'];

app.post('/grafana', jsonParser, (req, res) => {
    if (!req.body || !req.body.state || !grafanaStatuses.includes(req.body.state)) {
        res.sendStatus(400);
        return;
    }

    if (req.body.state === 'alerting') {
        alerting = true;
    } else if (req.body.state === 'ok') {
        alerting = false;
    }

    res.status(200).send(alerting ? {state: 'alerting'} : {state: 'ok'});
});

app.post('/fulfillment', (req, res) => {
    console.log('Fullfillment endpoint hit');
    res.send('hello world');
});

app.use(function(req, res) {
    res.status(404).send(`Route ${req.url} not found. Please contact the developer for more information.`);
});

module.exports = app.listen(port, () => {
    console.log(`Listening on ${port}`);
    app.emit('server_up');
});
