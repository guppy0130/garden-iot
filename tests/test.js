const request = require('supertest');
const should = require('should');
const port = process.env.PORT || 3000;
const app = request(`http://localhost:${port}`);

describe('Basic Tests', function() {
    before(function(done) {
        setTimeout(done, 500);
    });

    describe('/grafana endpoint', function() {
        const alert = {state: 'alerting'};
        const ok = {state: 'ok'};

        it('changes alerting state to high', function() {
            return app
                .post('/grafana')
                .send(alert)
                .expect(200)
                .then(response => {
                    should.deepEqual(response.body, alert);
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

        it('errors on changing alerting state to a value grafana doesn\'t serve', function() {
            return app.post('/grafana').send({
                state: 'not a value'
            }).expect(400);
        });
    });

    describe('/fulfillment endpoint', function() {
        it('doesn\'t do anything yet');
    });

    describe('Nonexistent endpoint', function() {
        it('404s on unknown URLs', function() {
            return app.post('/unknown').send({
                state: 'alerting'
            }).expect(404);
        });
    });
});
