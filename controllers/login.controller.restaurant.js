var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    // log user out
    delete req.session.token;
});

router.post('/', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/restaurants/authenticate',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.send({ error: 'An error occurred' });
        }

        if (!body.token) {
            return res.send({ error: body, username: req.body.username });
        }

        // save JWT token in the session to make it available to the angular app
        req.session.token = body.token;
    });
});

module.exports = router;