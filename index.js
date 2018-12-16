const express = require('express');
const bodyParser = require('body-parser');
const auth = require('basic-auth');
const jsonParser = bodyParser.json();
const app = express();
const port = process.env.PORT || 3000;
const users = [{
    name: 'grafana',
    pass: process.env.GRAFANAPASS
}, {
    name: 'google',
    pass: process.env.GOOGLEPASS
}];

if (process.env.NODE_ENV !== 'production') {
    users.push({
        name: 'test',
        pass: 'password'
    });
}

let alerting = {};
const grafanaStatuses = ['ok', 'paused', 'alerting', 'pending', 'no_data'];

/* helper auth methods */
const authHelper = (user) => {
    return users.some(elem => {
        return (user.name === elem.name) && (user.pass === elem.pass);
    });
};

const authenticator = (req, res, next) => {
    const user = auth(req);
    if (!user || !authHelper({name: user.name, pass: user.pass})) {
        res.sendStatus(401);
        return;
    }
    next();
};

app.use(authenticator);

app.post('/grafana', jsonParser, (req, res) => {
    if (!req.body ||
        !req.body.state ||
        !grafanaStatuses.includes(req.body.state) ||
        !req.body.message) {
        res.sendStatus(400);
        return;
    }

    let pot = req.body.message.split(' ')[3];
    let plant = req.body.message.split(' ')[1];

    if (req.body.state === 'alerting') {
        alerting[`${plant}-${pot}`] = true;
        res.send(req.body);
    } else if (req.body.state === 'ok') {
        alerting[`${plant}-${pot}`] = false;
        res.send(req.body);
    }
    return;
});

app.get('/grafana/:plant/:pot', (req, res) => {
    if (alerting[`${req.params.plant}-${req.params.pot}`] != undefined) {
        res.send(alerting[`${req.params.plant}-${req.params.pot}`]);
        return;
    }
    res.sendStatus(404);
    return;
});

app.post('/fulfillment', jsonParser, (req, res) => {
    if (!req.body ||
        !req.body.queryResult) {
        res.sendStatus(400);
        return;
    }

    let color = req.body.queryResult.parameters.color;
    let plant = req.body.queryResult.parameters.plant;
    if (alerting[`${plant}-${color}`] === undefined) {
        res.json({
            source: req.get('host'),
            fulfillmentText: 'Sorry, plant not found'
        });
        return;
    }

    let information = {};

    information['source'] = req.get('host');
    information['fulfillmentText'] = alerting[`${plant}-${color}`] ? `Yes, you need to water ${plant} in the ${color} pot` : `No need to water ${plant} in the ${color} pot`;
    res.json(information);
});

app.use(function(req, res) {
    res.status(404).send(`Route ${req.url} not found. Please contact the developer for more information.`);
});

module.exports = app.listen(port, () => {
    console.log(`Listening on ${port}`);
    app.emit('server_up');
});
