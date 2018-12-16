const request = require('supertest');
const should = require('should');
const port = process.env.PORT || 3000;
const host = 'localhost';
const app = request(`http://${host}:${port}`);
const server = require('../index');

/* some reusables */
const color = 'orange';
const plant = 'leaves';
const badColor = 'red';
const alert = {
    evalMatches: [
        {
            value: 21.804166666666667,
            metric: 'stats_counts.moisture',
            tags: null
        }
    ],
    message: `Water ${plant} in ${color} pot!`,
    ruleId: 3,
    ruleName: 'Moisture Alert',
    state: 'alerting',
    title: '[Alerting] Moisture Alert'
};

const ok = {
    evalMatches: [],
    message: `Water ${plant} in ${color} pot!`,
    ruleId: 3,
    ruleName: 'Moisture Alert',
    state: 'ok',
    title: '[OK] Moisture Alert'
};

const partialExampleQuery = {
    queryResult: {
        queryText: `do I need to water ${plant} in the ${color} pot`,
        action: 'input.welcome',
        parameters: {color, plant},
        allRequiredParamsPresent: true
    }
};

before(function(done) {
    server.on('server_up', done());
});

describe('Basic Tests', function() {

    describe('/grafana endpoint', function() {
        it('changes alerting state to high', function() {
            return app
                .post('/grafana')
                .send(alert)
                .expect(200)
                .then(response => {
                    should.deepEqual(response.body, alert);
                });
        });

        it('returns a state that\'s been set', function() {
            return app
                .get(`/grafana/${plant}/${color}`)
                .expect(200)
                .then(response => {
                    response.body.should.be.true();
                    response.body.should.not.be.false();
                });
        });

        it('changes alerting state to low', function() {
            return app
                .post('/grafana')
                .send(ok)
                .expect(200)
                .then(response => {
                    should.deepEqual(response.body, ok);
                });
        });

        it('returns the low state', function() {
            return app
                .get(`/grafana/${plant}/${color}`)
                .expect(200)
                .then(response => {
                    response.body.should.not.be.true();
                    response.body.should.be.false();
                });
        });

        it('errors on changing alerting state to a value grafana doesn\'t serve', function() {
            return app.post('/grafana').send({
                state: 'not a value'
            }).expect(400);
        });

        it('cannot find a state that doesn\'t exist', function() {
            return app
                .get(`/grafana/${plant}/${badColor}`)
                .expect(404);
        });
    });

    describe('/fulfillment endpoint', function() {
        const responseKeys = ['fulfillmentText', 'source', ];

        it('returns the right keys', function() {
            return app
                .post('/fulfillment')
                .send(partialExampleQuery)
                .expect(200)
                .then(response => {
                    response.body.should.only.have.keys(...responseKeys);
                    response.body['source'].should.match(new RegExp(host));
                });
        });

        it('says yes when water alert is high', function() {
            let prep = app
                .post('/grafana')
                .send(alert)
                .expect(200)
                .then(response => {
                    should.deepEqual(response.body, alert);
                });
            let rest = app
                .post('/fulfillment')
                .send(partialExampleQuery)
                .expect(200)
                .then(response => {
                    response.body.should.have.keys(...responseKeys);
                    response.body['fulfillmentText'].should.be.a.String().and.match(new RegExp('Yes'));
                });
            return Promise.all([prep, rest]);
        });

        it('says no when water alert is low', function() {
            let prep = app
                .post('/grafana')
                .send(ok)
                .expect(200)
                .then(response => {
                    should.deepEqual(response.body, ok);
                });
            let rest = app
                .post('/fulfillment')
                .send(partialExampleQuery)
                .expect(200)
                .then(response => {
                    response.body.should.have.keys(...responseKeys);
                    response.body['fulfillmentText'].should.be.a.String().and.match(new RegExp('No'));
                });
            return Promise.all([prep, rest]);
        });

        it('says no plant found when searching for an incorrect pot', function() {
            let badPartialQuery = JSON.parse(JSON.stringify(partialExampleQuery));
            badPartialQuery.queryResult.parameters.color = badColor;
            return app
                .post('/fulfillment')
                .send(badPartialQuery)
                .expect(200)
                .then(response => {
                    response.body.should.have.keys(...responseKeys);
                    response.body['fulfillmentText'].should.be.a.String().and.match(new RegExp('Sorry'));
                });
        });
    });

    describe('Nonexistent endpoint', function() {
        it('404s on unknown URLs', function() {
            return app.post('/unknown').send({
                state: 'alerting'
            }).expect(404);
        });
    });
});

after(function(done) {
    server.close(done);
});
